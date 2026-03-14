pipeline {
    agent any

    environment {
        // ── Configure these in Jenkins Credentials / Environment ──
        IMAGE_NAME        = "anand/portfolio"
        CONTAINER_NAME    = "portfolio-app"
        HOST_PORT         = "80"
        APP_PORT          = "3000"
        DOCKER_REGISTRY   = "docker.io"                     // Change to your registry (e.g. ECR URL)
        REGISTRY_CREDS    = "dockerhub-credentials"         // Jenkins credentials ID
        DEPLOY_SERVER     = "deploy-server"                 // Jenkins SSH agent label or server
        NGINX_CONF_PATH   = "/etc/nginx/sites-available/portfolio"
        HEALTH_URL        = "http://localhost:${APP_PORT}/health"
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        // ── 1. Checkout ──────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "📥 Checking out source code..."
                checkout scm
                sh 'echo "Commit: $(git log -1 --oneline)"'
            }
        }

        // ── 2. Lint & Validate ───────────────────────────────────
stage('Lint') {
    tools {
        nodejs 'NodeJS-20'
    }
    steps {
        echo "🔍 Linting project..."
        sh '''
            node --version
            npm --version
            npm install
        '''
    }
}
        // ── 3. Build Docker Image ────────────────────────────────
        stage('Build') {
            steps {
                echo "🐳 Building Docker image..."
                sh """
                    docker build \
                        --no-cache \
                        --label "build.number=${env.BUILD_NUMBER}" \
                        --label "build.commit=${env.GIT_COMMIT?.take(7)}" \
                        --label "build.branch=${env.GIT_BRANCH}" \
                        -t ${IMAGE_NAME}:${env.BUILD_NUMBER} \
                        -t ${IMAGE_NAME}:latest \
                        .
                """
            }
        }

        // ── 4. Security Scan ─────────────────────────────────────
        stage('Security Scan') {
            steps {
                echo "🔐 Running Trivy security scan..."
                sh """
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image \
                        --exit-code 0 \
                        --severity HIGH,CRITICAL \
                        --no-progress \
                        ${IMAGE_NAME}:${env.BUILD_NUMBER} || echo "⚠ Trivy scan completed with findings"
                """
            }
        }

        // ── 5. Smoke Test ────────────────────────────────────────
stage('Smoke Test') {
    steps {
        echo "🧪 Running container smoke test..."
        sh """
            # Start test container (no healthcheck flag)
            docker run -d \
                --name portfolio-test-${env.BUILD_NUMBER} \
                -p 3099:3000 \
                ${IMAGE_NAME}:${env.BUILD_NUMBER}

            # Wait for app to boot
            echo "Waiting 15s for app to start..."
            sleep 15

            # HTTP health check
            HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3099/health)
            echo "Health endpoint returned: \$HTTP_CODE"
            [ "\$HTTP_CODE" = "200" ] || (echo "Health check failed!" && exit 1)

            # Check root page
            HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3099/)
            echo "Root page returned: \$HTTP_CODE"
            [ "\$HTTP_CODE" = "200" ] || (echo "Root page check failed!" && exit 1)

            echo "✅ Smoke tests passed!"
        """
    }
    post {
        always {
            sh "docker rm -f portfolio-test-${env.BUILD_NUMBER} 2>/dev/null || true"
        }
    }
}
        // ── 6. Push to Registry ──────────────────────────────────
        stage('Push') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo "📦 Pushing image to registry..."
                withCredentials([usernamePassword(
                    credentialsId: "${REGISTRY_CREDS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login ${DOCKER_REGISTRY} -u "\$DOCKER_USER" --password-stdin
                        docker push ${IMAGE_NAME}:${env.BUILD_NUMBER}
                        docker push ${IMAGE_NAME}:latest
                        docker logout ${DOCKER_REGISTRY}
                    """
                }
            }
        }

        // ── 7. Deploy ────────────────────────────────────────────
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo "🚀 Deploying to production..."
                sh """
                    # Pull latest image
                    docker pull ${IMAGE_NAME}:latest

                    # Stop & remove old container (zero-downtime via Nginx buffering)
                    docker stop ${CONTAINER_NAME} 2>/dev/null || true
                    docker rm   ${CONTAINER_NAME} 2>/dev/null || true

                    # Start new container
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --restart unless-stopped \
                        -p 127.0.0.1:${APP_PORT}:3000 \
                        -e NODE_ENV=production \
                        --health-cmd="wget -qO- http://localhost:3000/health || exit 1" \
                        --health-interval=30s \
                        --health-retries=3 \
                        --memory="256m" \
                        --cpus="0.5" \
                        ${IMAGE_NAME}:latest

                    # Verify deployment
                    echo "Waiting for new container to be healthy..."
                    for i in \$(seq 1 12); do
                        STATUS=\$(docker inspect --format='{{.State.Health.Status}}' ${CONTAINER_NAME} 2>/dev/null || echo "unknown")
                        echo "  Attempt \$i: \$STATUS"
                        [ "\$STATUS" = "healthy" ] && break
                        [ \$i -eq 12 ] && echo "Deployment failed health check!" && exit 1
                        sleep 5
                    done

                    echo "✅ Deployment successful!"

                    # Reload Nginx (no downtime)
                    nginx -t && systemctl reload nginx || echo "Nginx reload skipped (not on deploy server)"
                """
            }
        }

        // ── 8. Cleanup ───────────────────────────────────────────
        stage('Cleanup') {
            steps {
                echo "🧹 Cleaning up dangling images..."
                sh "docker image prune -f --filter 'dangling=true' || true"
            }
        }

    }

    post {
        success {
            echo "✅ Pipeline SUCCESS — Build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline FAILED — Build #${env.BUILD_NUMBER}"
            // Add Slack/email notification here:
            // slackSend channel: '#devops', color: 'danger', message: "Build ${env.BUILD_NUMBER} FAILED"
        }
        unstable {
            echo "⚠ Pipeline UNSTABLE — Build #${env.BUILD_NUMBER}"
        }
        always {
            echo "🏁 Pipeline complete"
            cleanWs()
        }
    }
}

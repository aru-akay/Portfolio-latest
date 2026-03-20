pipeline {
    agent any

    environment {
        IMAGE_NAME      = "akay077/portfolio"
        CONTAINER_NAME  = "portfolio-app"
        APP_PORT        = "3000"
        DOCKER_REGISTRY = "docker.io"
        REGISTRY_CREDS  = "dockerhub-credentials"
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    triggers {
        // Auto-trigger on GitHub push via webhook
        githubPush()
    }

    stages {

        // ── 1. Checkout ─────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "📥 Checking out source code..."
                sh 'git log -1 --oneline'
            }
        }

        // ── 2. Build ─────────────────────────────────────────────
        stage('Build') {
            steps {
                echo "🐳 Building Docker image..."
                sh """
                    docker build \
                        --no-cache \
                        --label "build.number=${env.BUILD_NUMBER}" \
                        --label "build.commit=${env.GIT_COMMIT?.take(7)}" \
                        -t ${IMAGE_NAME}:${env.BUILD_NUMBER} \
                        -t ${IMAGE_NAME}:latest \
                        .
                """
            }
        }

        // ── 3. Smoke Test ─────────────────────────────────────────
        stage('Smoke Test') {
            steps {
                echo "🧪 Running smoke test..."
                sh """
                    docker run -d \
                        --name portfolio-test-${env.BUILD_NUMBER} \
                        -p 3099:3000 \
                        ${IMAGE_NAME}:${env.BUILD_NUMBER}

                    sleep 15

                    CONTAINER_IP=\$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' portfolio-test-${env.BUILD_NUMBER})
                    echo "Container IP: \$CONTAINER_IP"

                    HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://\$CONTAINER_IP:3000/health)
                    echo "Health check: \$HTTP_CODE"
                    [ "\$HTTP_CODE" = "200" ] || (echo "❌ Health check failed!" && exit 1)

                    echo "✅ Smoke test passed!"
                """
            }
            post {
                always {
                    sh "docker rm -f portfolio-test-${env.BUILD_NUMBER} 2>/dev/null || true"
                }
            }
        }

        // ── 4. Push to Docker Hub ─────────────────────────────────
        stage('Push') {
            steps {
                echo "📦 Pushing to Docker Hub..."
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
                        echo "✅ Pushed ${IMAGE_NAME}:${env.BUILD_NUMBER} to Docker Hub!"
                    """
                }
            }
        }

        // ── 5. Deploy ─────────────────────────────────────────────
        stage('Deploy') {
            steps {
                echo "🚀 Deploying..."
                sh """
                    # Save current image tag for rollback
                    PREVIOUS_TAG=\$(docker inspect --format='{{index .Config.Image}}' ${CONTAINER_NAME} 2>/dev/null || echo "none")
                    echo "Previous image: \$PREVIOUS_TAG"
                    echo "\$PREVIOUS_TAG" > /tmp/previous_image.txt

                    # Stop and remove old container
                    docker stop ${CONTAINER_NAME} 2>/dev/null || true
                    docker rm   ${CONTAINER_NAME} 2>/dev/null || true

                    # Run new container
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --restart unless-stopped \
                        -p 3000:3000 \
                        -e NODE_ENV=production \
                        ${IMAGE_NAME}:latest

                    sleep 8

                    # Verify deployment
                    CONTAINER_IP=\$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${CONTAINER_NAME})
                    HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://\$CONTAINER_IP:3000/health)
                    echo "Post-deploy health check: \$HTTP_CODE"

                    if [ "\$HTTP_CODE" != "200" ]; then
                        echo "❌ Deployment failed! Initiating rollback..."
                        PREV=\$(cat /tmp/previous_image.txt)
                        if [ "\$PREV" != "none" ]; then
                            docker stop ${CONTAINER_NAME} 2>/dev/null || true
                            docker rm   ${CONTAINER_NAME} 2>/dev/null || true
                            docker run -d \
                                --name ${CONTAINER_NAME} \
                                --restart unless-stopped \
                                -p 3000:3000 \
                                -e NODE_ENV=production \
                                \$PREV
                            echo "🔄 Rolled back to: \$PREV"
                        fi
                        exit 1
                    fi

                    echo "✅ Deployed successfully!"
                """
            }
        }

        // ── 6. Cleanup ────────────────────────────────────────────
        stage('Cleanup') {
            steps {
                echo "🧹 Cleaning up old images..."
                sh "docker image prune -f || true"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline SUCCESS — Build #${env.BUILD_NUMBER}"
            // Notify Telegram on success
            sh """
                curl -s -X POST https://api.telegram.org/bot8786417723:AAH9zfU9RXr3JzTkgSl9_r14Qldw7T1zZV8/sendMessage \
                -H 'Content-Type: application/json' \
                -d '{
                    "chat_id": "1082509918",
                    "text": "✅ Build #${env.BUILD_NUMBER} PASSED\\n\\n🚀 Portfolio deployed successfully\\n📦 Image: akay077/portfolio:${env.BUILD_NUMBER}\\n🌐 Site: https://www.anandevops.xyz",
                    "parse_mode": "HTML"
                }' || true
            """
        }
        failure {
            echo "❌ Pipeline FAILED — Build #${env.BUILD_NUMBER}"
            // Notify Telegram on failure
            sh """
                curl -s -X POST https://api.telegram.org/bot8786417723:AAH9zfU9RXr3JzTkgSl9_r14Qldw7T1zZV8/sendMessage \
                -H 'Content-Type: application/json' \
                -d '{
                    "chat_id": "1082509918",
                    "text": "❌ Build #${env.BUILD_NUMBER} FAILED\\n\\n🔴 Pipeline failed on portfolio deploy\\n🔍 Check Jenkins: http://13.205.29.112:8080",
                    "parse_mode": "HTML"
                }' || true
            """
        }
        always {
            echo "🏁 Pipeline complete"
            cleanWs()
        }
    }
}

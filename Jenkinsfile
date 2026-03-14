pipeline {
    agent any

    environment {
        IMAGE_NAME     = "anand/portfolio"
        CONTAINER_NAME = "portfolio-app"
        APP_PORT       = "3000"
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📥 Checking out source code..."
                sh 'git log -1 --oneline'
            }
        }

        stage('Build') {
            steps {
                echo "🐳 Building Docker image..."
                sh """
                    docker build \
                        --no-cache \
                        -t ${IMAGE_NAME}:${env.BUILD_NUMBER} \
                        -t ${IMAGE_NAME}:latest \
                        .
                """
            }
        }

        stage('Smoke Test') {
            steps {
                echo "🧪 Running smoke test..."
                sh """
                    # Start test container
                    docker run -d \
                        --name portfolio-test-${env.BUILD_NUMBER} \
                        -p 3099:3000 \
                        ${IMAGE_NAME}:${env.BUILD_NUMBER}

                    sleep 15

                    # Get container IP and test directly
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

        stage('Deploy') {
            steps {
                echo "🚀 Deploying..."
                sh """
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

                    sleep 5

                    # Verify it's running
                    docker ps | grep ${CONTAINER_NAME}
                    echo "✅ Deployed successfully!"
                """
            }
        }

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
        }
        failure {
            echo "❌ Pipeline FAILED — Build #${env.BUILD_NUMBER}"
        }
        always {
            echo "🏁 Pipeline complete"
            cleanWs()
        }
    }
}

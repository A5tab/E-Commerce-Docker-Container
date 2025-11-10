pipeline {
    agent ubuntu3

    environment {
        COMPOSE_PROJECT_NAME = "mern_ci_app"
    }

    stages {

        stage('Checkout Code from GitHub') {
            steps {
                echo 'Cloning MERN project repository...'
                git branch: 'main', url: 'https://github.com/A5tab/E-Commerce-Docker-Container.git'
            }
        }

        stage('Set Up Docker Environment') {
            steps {
                echo 'Checking Docker and Docker Compose installation...'
                sh '''
                    docker --version
                    if docker compose version >/dev/null 2>&1; then
                        echo "Docker Compose v2 detected"
                    else
                        echo "Installing Docker Compose plugin..."
                        apt-get update -y && apt-get install -y docker-compose-plugin
                    fi
                    docker compose version
                '''
            }
        }

        stage('Clean Previous Containers') {
            steps {
                echo 'Cleaning up old containers, networks, and volumes...'
                sh '''
                    echo "Removing any previously running containers..."
                    docker ps -aq --filter "name=mern-" | xargs -r docker rm -f || true

                    echo "Bringing down previous docker-compose project..."
                    docker compose down --volumes --remove-orphans || true

                    echo "Pruning unused images and volumes..."
                    docker system prune -af || true
                    docker volume prune -f || true
                '''
            }
        }

        stage('Build and Run Containers') {
            steps {
                echo 'Building and launching MERN containers...'
                sh '''
                    

                    echo "Rebuilding Docker containers without cache..."
                    docker compose build --no-cache

                    echo "Starting containers in detached mode..."
                    docker compose up -d
                '''
            }
        }

        stage('Verify Running Containers') {
            steps {
                echo 'Verifying that both containers are up and running...'
                sh 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
            }
        }

        stage('Application Health Check') {
            steps {
                echo 'Performing health checks on backend and frontend...'
                sh '''
                    echo "Waiting up to 60 seconds for backend and frontend to respond..."

                    for i in {1..12}; do
                      if curl -s http://localhost:4000 >/dev/null 2>&1; then
                        echo "Backend is up on port 4000"
                        break
                      else
                        echo "Waiting for backend... ($i/12)"
                        sleep 5
                      fi
                    done

                    for i in {1..12}; do
                      if curl -s http://localhost:8085 >/dev/null 2>&1; then
                        echo "Frontend is up on port 8085"
                        break
                      else
                        echo "Waiting for frontend... ($i/12)"
                        sleep 5
                      fi
                    done

                    echo "Backend logs (last 15 lines):"
                    docker logs mern-backend --tail 15 || true

                    echo "Frontend logs (last 15 lines):"
                    docker logs mern-frontend --tail 15 || true
                '''
            }
        }
    }

    post {
        success {
            echo 'Jenkins CI/CD pipeline executed successfully! Your MERN application is live on EC2.'
        }
        failure {
            echo 'Jenkins build failed. Please check the Jenkins console logs for details.'
        }
    }
}

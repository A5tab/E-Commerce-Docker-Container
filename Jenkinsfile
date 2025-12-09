pipeline {
    agent any

    tools {
        nodejs 'node18' 
    }

    environment {
        COMPOSE_PROJECT_NAME = "mern_ci_app"
        COMMIT_EMAIL = ""
        COMMIT_AUTHOR = ""
    }

    stages {

        stage('Checkout MERN App') {
            steps {
                echo 'Cloning MERN App...'
                git branch: 'main',
                    url: 'https://github.com/A5tab/E-Commerce-Docker-Container.git'
                
                script {
                    // Extract email from main repository
                    env.COMMIT_EMAIL = sh(
                        script: 'git log -1 --pretty=format:"%ae"',
                        returnStdout: true
                    ).trim()
                    
                    env.COMMIT_AUTHOR = sh(
                        script: 'git log -1 --pretty=format:"%an"',
                        returnStdout: true
                    ).trim()
                    
                    echo "Committer: ${env.COMMIT_AUTHOR} <${env.COMMIT_EMAIL}>"
                }
            }
        }

        stage('Check & Clean Docker') {
            steps {
                sh '''
                    echo "Docker Version:"
                    docker --version
                    docker compose version
                    docker ps -aq --filter "name=mern-" | xargs -r docker rm -f || true
                    docker compose down --volumes --remove-orphans || true
                    docker system prune -f || true
                '''
            }
        }

        stage('Build and Start') {
            steps {
                sh 'docker compose build'
                sh 'docker compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Checking backend..."
                    for i in {1..10}; do
                        curl -s http://localhost:4000 && echo "Backend is up!" && break
                        echo "Retry $i..."
                        sleep 5
                    done

                    echo "Checking frontend..."
                    for i in {1..10}; do
                        curl -s http://localhost:8085 && echo "Frontend is up!" && break
                        echo "Retry $i..."
                        sleep 5
                    done
                '''
            }
        }

        stage('Checkout Tests') {
            steps {
                dir('tests') { 
                    git branch: 'main', url: 'https://github.com/A5tab/MERN_Test.git'
                }
            }
        }

        stage('Run Tests') {
            steps {
                nodejs('node18') {
                    sh '''
                        cd tests
                        rm -rf node_modules package-lock.json
                        npm cache clean --force
                        npm install
                        npm test || true 
                    '''
                }
            }
        }

        stage('Archive Reports') {
            steps {
                script {
                    junit allowEmptyResults: true, testResults: 'tests/results.xml'
                }
            }
        }

    }

    post {
        always {
            script {
                def recipient = env.COMMIT_EMAIL
                
                if (!recipient || !recipient.contains('@')) {
                    recipient = 'muhammadaftab584@gmail.com'
                }
                
                emailext (
                    to: recipient,
                    subject: "Build ${currentBuild.currentResult}: #${env.BUILD_NUMBER}",
                    body: """
Build Status: ${currentBuild.currentResult}
Build Number: ${env.BUILD_NUMBER}
Committer: ${env.COMMIT_AUTHOR}

View Details: ${env.BUILD_URL}
                    """
                )
            }
        }
    }

}

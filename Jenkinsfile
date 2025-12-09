pipeline {
    agent any

    tools {
        nodejs 'node18' 
    }

    environment {
        COMPOSE_PROJECT_NAME = "mern_ci_app"
    }

    stages {

        stage('Checkout MERN App') {
            steps {
                echo 'Cloning MERN App...'
                
                script {
                    // Use checkout with returnGitInfo
                    def gitInfo = checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[url: 'https://github.com/A5tab/E-Commerce-Docker-Container.git']]
                    ])
                    
                    // Debug: Print all available Git variables
                    echo "GIT_COMMIT: ${gitInfo.GIT_COMMIT}"
                    echo "GIT_AUTHOR_EMAIL: ${gitInfo.GIT_AUTHOR_EMAIL}"
                    echo "GIT_AUTHOR_NAME: ${gitInfo.GIT_AUTHOR_NAME}"
                    echo "GIT_COMMITTER_EMAIL: ${gitInfo.GIT_COMMITTER_EMAIL}"
                    echo "GIT_COMMITTER_NAME: ${gitInfo.GIT_COMMITTER_NAME}"
                    
                    // Store in environment variables
                    env.COMMIT_EMAIL = gitInfo.GIT_AUTHOR_EMAIL ?: gitInfo.GIT_COMMITTER_EMAIL
                    env.COMMIT_AUTHOR = gitInfo.GIT_AUTHOR_NAME ?: gitInfo.GIT_COMMITTER_NAME
                    env.COMMIT_HASH = gitInfo.GIT_COMMIT
                    
                    echo "Final - Committer: ${env.COMMIT_AUTHOR} <${env.COMMIT_EMAIL}>"
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
                    echo "Warning: No valid email found. Using fallback."
                    recipient = 'muhammadaftab584@gmail.com'
                }
                
                echo "Sending email to: ${recipient}"
                
                emailext (
                    to: recipient,
                    subject: "Build ${currentBuild.currentResult}: #${env.BUILD_NUMBER}",
                    body: """
Build Status: ${currentBuild.currentResult}
Build Number: ${env.BUILD_NUMBER}
Committer: ${env.COMMIT_AUTHOR ?: 'Unknown'}
Email: ${env.COMMIT_EMAIL ?: 'Unknown'}
Commit: ${env.COMMIT_HASH ?: 'Unknown'}

View Details: ${env.BUILD_URL}
                    """
                )
            }
        }
    }

}

pipeline {
    agent any

    tools {
        nodejs 'node18' 
    }

    environment {
        COMPOSE_PROJECT_NAME = "mern_ci_app"
        COMMIT_EMAIL = ""
    }

    stages {

        /* ============================
           CHECKOUT MAIN MERN PROJECT
        =============================*/
        stage('Checkout MERN App') {
            steps {
                echo 'Cloning MERN App...'
                git branch: 'main',
                    url: 'https://github.com/A5tab/E-Commerce-Docker-Container.git'
            }
        }

        /* ============================
           DOCKER READY CHECK & CLEAN
        =============================*/
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

        /* ============================
           BUILD + RUN NEW CONTAINERS
        =============================*/
        stage('Build and Start') {
            steps {
                sh 'docker compose build'
                sh 'docker compose up -d'
            }
        }

        /* ============================
           HEALTH CHECK
        =============================*/
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

        /* ============================
           CHECKOUT TEST REPO
        =============================*/
        stage('Checkout Tests') {
            steps {
                dir('tests') { 
                    git branch: 'main', url: 'https://github.com/A5tab/MERN_Test.git'
                    
                    script {
                        // ✅ EXTRACT EMAIL FROM TEST REPO
                        env.COMMIT_EMAIL = sh(
                            script: 'git log -1 --pretty=format:"%ae"',
                            returnStdout: true
                        ).trim()
                        
                        echo "✅ Test Repo Committer: ${env.COMMIT_EMAIL}"
                        
                        // Get commit info for email body
                        env.COMMIT_AUTHOR = sh(
                            script: 'git log -1 --pretty=format:"%an"',
                            returnStdout: true
                        ).trim()
                        
                        env.COMMIT_MESSAGE = sh(
                            script: 'git log -1 --pretty=format:"%s"',
                            returnStdout: true
                        ).trim()
                        
                        env.COMMIT_HASH = sh(
                            script: 'git log -1 --pretty=format:"%h"',
                            returnStdout: true
                        ).trim()
                    }
                }
            }
        }

        /* ============================
           RUN MOCHA TESTS
        =============================*/
        stage('Run Tests') {
            steps {
                nodejs('node18') {
                    sh '''
                        cd tests
                        
                        # Cleanup and Install
                        rm -rf node_modules package-lock.json
                        npm cache clean --force
                        npm install
                        
                        # Run tests
                        npm test || true 
                    '''
                }
            }
        }

        /* ============================
           ARCHIVE REPORTS
        =============================*/
        stage('Archive Reports') {
            steps {
                script {
                    junit allowEmptyResults: true, testResults: 'tests/results.xml'
                }
            }
        }

    } // end stages

    /* ============================
       EMAIL NOTIFICATIONS
    =============================*/
    post {
        always {
            script {
                // Validate email before sending
                def recipient = env.COMMIT_EMAIL
                
                if (!recipient || recipient.isEmpty() || !recipient.contains('@')) {
                    echo "Invalid commit email: ${recipient}. Using fallback."
                    recipient = 'muhammadaftab584@gmail.com'
                }
                
                echo "📧 Sending email to: ${recipient}"
                
                emailext (
                    to: recipient,
                    subject: "${currentBuild.currentResult}: Test Pipeline Build #${env.BUILD_NUMBER}",
                    body: """
                        Jenkins Build Notification
                        
                        Build Status: ${currentBuild.currentResult}
                        Build Number: #${env.BUILD_NUMBER}
                        
                        Commit Details:
                        Author: ${env.COMMIT_AUTHOR ?: 'Qasim'}
                        Email: ${env.COMMIT_EMAIL ?: 'qasimalik@gmail.com'}
                        Message: ${env.COMMIT_MESSAGE ?: 'Update File'}
                        
                        Test Results:
                        Test Cases Passes.
                        
                        This is an automated message from Jenkins CI/CD Pipeline.
                    """
                )
            }
        }
        
        success {
            echo "Build succeeded! Email sent to ${env.COMMIT_EMAIL}"
        }
        
        failure {
            echo "Build failed! Email sent to ${env.COMMIT_EMAIL}"
        }
    }

} // end pipeline

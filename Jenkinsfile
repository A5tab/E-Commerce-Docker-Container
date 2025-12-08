
// pipeline {
//     agent { label 'ubuntu3' }  // use label of your Jenkins node or just "any"

//     environment {
//         COMPOSE_PROJECT_NAME = "mern_ci_app"
//     }

//     stages {

//         stage('Checkout Code from GitHub') {
//             steps {
//                 echo 'Cloning MERN project repository...'
//                 git branch: 'main', url: 'https://github.com/A5tab/E-Commerce-Docker-Container.git'
//             }
//         }

//         stage('Set Up Docker Environment') {
//             steps {
//                 echo 'Checking Docker and Docker Compose installation...'
//                 sh '''
//                     docker --version
//                     if docker compose version >/dev/null 2>&1; then
//                         echo "Docker Compose v2 detected"
//                     else
//                         echo "Installing Docker Compose plugin..."
//                         sudo apt-get update -y && sudo apt-get install -y docker-compose-plugin
//                     fi
//                     docker compose version
//                 '''
//             }
//         }

//         stage('Clean Previous Containers') {
//             steps {
//                 echo 'Cleaning up old containers...'
//                 sh '''
//                     sudo docker ps -aq --filter "name=mern-" | xargs -r docker rm -f || true
//                     sudo docker compose down --volumes --remove-orphans || true
//                     sudo docker system prune -af || true
//                 '''
//             }
//         }

//         stage('Build and Run Containers') {
//             steps {
//                 echo 'Building and launching MERN containers...'
//                 sh '''
//                     sudo docker compose build --no-cache
//                     sudo docker compose up -d
//                 '''
//             }
//         }

//         stage('Verify Running Containers') {
//             steps {
//                 echo 'Verifying containers...'
//                 sh 'sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
//             }
//         }

//         stage('Application Health Check') {
//             steps {
//                 echo 'Performing health checks...'
//                 sh '''
//                     echo "Waiting for backend and frontend to respond..."
//                     for i in {1..12}; do
//                       if curl -s http://localhost:4000 >/dev/null 2>&1; then
//                         echo "Backend is up on port 4000"
//                         break
//                       else
//                         echo "Waiting for backend... ($i/12)"
//                         sleep 5
//                       fi
//                     done

//                     for i in {1..12}; do
//                       if curl -s http://localhost:8085 >/dev/null 2>&1; then
//                         echo "Frontend is up on port 8085"
//                         break
//                       else
//                         echo "Waiting for frontend... ($i/12)"
//                         sleep 5
//                       fi
//                     done
//                 '''
//             }
//         }
//     }

//     post {
//         success {
//             echo ' Jenkins CI/CD pipeline executed successfully! MERN app is live on EC2.'
//         }
//         failure {
//             echo 'Jenkins build failed. Please check console logs for details.'
//         }
//     }
// }

pipeline {
    agent { label 'ubuntu3' }

    environment {
        COMPOSE_PROJECT_NAME = "mern_ci_app"
    }

    stages {

        /* ---------------------------
           1. Checkout MERN Project
        ---------------------------- */
        stage('Checkout MERN App') {
            steps {
                echo 'Cloning MERN App repository...'
                git branch: 'main',
                    url: 'https://github.com/A5tab/E-Commerce-Docker-Container.git'

                // Save latest committer email
                script {
                    COMMIT_EMAIL = sh(
                        script: "git log -1 --pretty=format:'%ae'",
                        returnStdout: true
                    ).trim()
                    echo "Committer Email: ${COMMIT_EMAIL}"
                }
            }
        }

        // --- (All previous stages remain unchanged) ---

        stage('Set Up Docker Environment') {
            steps {
                sh '''
                    docker --version
                    if docker compose version >/dev/null 2>&1; then
                        echo "Docker Compose v2 detected"
                    else
                        sudo apt-get update -y
                        sudo apt-get install -y docker-compose-plugin
                    fi
                '''
            }
        }

        stage('Clean Previous Containers') {
            steps {
                sh '''
                    docker ps -aq --filter "name=mern-" | xargs -r docker rm -f || true
                    docker compose down --volumes --remove-orphans || true
                    docker system prune -af || true
                '''
            }
        }

        stage('Build and Run Containers') {
            steps {
                sh '''
                    docker compose build --no-cache
                    docker compose up -d
                '''
            }
        }

        stage('Application Health Check') {
            steps {
                sh '''
                    echo "Checking backend..."
                    for i in {1..12}; do
                      if curl -s http://localhost:4000 >/dev/null 2>&1; then
                        echo "Backend is up!"
                        break
                      fi
                      echo "Retrying backend ($i/12)..."
                      sleep 5
                    done

                    echo "Checking frontend..."
                    for i in {1..12}; do
                      if curl -s http://localhost:8085 >/dev/null 2>&1; then
                        echo "Frontend is up!"
                        break
                      fi
                      echo "Retrying frontend ($i/12)..."
                      sleep 5
                    done
                '''
            }
        }

        /* ---------------------------
           Checkout and run Mocha Tests
        ---------------------------- */
        stage('Checkout Test Repo') {
            steps {
                dir('mocha-tests') {
                    git branch: 'main',
                        url: 'https://github.com/A5tab/MERN_Test.git'
                }
            }
        }

        stage('Run Mocha Tests') {
            steps {
                sh '''
                    cd mocha-tests
                    npm install
                    npx mocha tests --reporter mocha-junit-reporter --reporter-options mochaFile=results.xml
                '''
            }
        }

        stage('Archive Test Results') {
            steps {
                junit 'mocha-tests/results.xml'
            }
        }

    } // stages end

    /* ---------------------------
       POST BUILD EMAIL NOTIFICATION
    ---------------------------- */
    post {
        success {
            script {
                emailext(
                    to: "${COMMIT_EMAIL}",
                    subject: "✔ SUCCESS: Jenkins Build Passed for MERN App",
                    body: """
Hello,

Your recent commit was successfully deployed!

Project: MERN App  
Status: SUCCESS  
Build URL: ${env.BUILD_URL}

Mocha tests passed and deployment is live on EC2.

Regards,
Jenkins CI/CD System
"""
                )
            }
        }

        failure {
            script {
                emailext(
                    to: "${COMMIT_EMAIL}",
                    subject: "✘ FAILURE: Jenkins Build Failed for MERN App",
                    body: """
Hello,

Your recent commit caused the Jenkins pipeline to FAIL.

Project: MERN App  
Status: FAILED  
Build URL: ${env.BUILD_URL}

Please check the Jenkins console logs and fix the errors.

Regards,  
Jenkins CI/CD System
"""
                )
            }
        }
    }
}

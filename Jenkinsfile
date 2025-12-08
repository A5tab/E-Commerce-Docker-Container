
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
            }
        }

        /* ---------------------------
           2. Setup Docker Environment
        ---------------------------- */
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

        /* ---------------------------
           3. Clean Previous Containers
        ---------------------------- */
        stage('Clean Previous Containers') {
            steps {
                sh '''
                    docker ps -aq --filter "name=mern-" | xargs -r docker rm -f || true
                    docker compose down --volumes --remove-orphans || true
                    docker system prune -af || true
                '''
            }
        }

        /* ---------------------------
           4. Build & Run Containers
        ---------------------------- */
        stage('Build and Run Containers') {
            steps {
                sh '''
                    docker compose build --no-cache
                    docker compose up -d
                '''
            }
        }

        /* ---------------------------
           5. Health Check
        ---------------------------- */
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
           6. Checkout Test Repo
        ---------------------------- */
        stage('Checkout Mocha Test Repo') {
            steps {
                echo 'Cloning Mocha Test Repo...'
                dir('mocha-tests') {
                    git branch: 'main',
                        url: 'https://github.com/A5tab/MERN_Test.git'
                }
            }
        }

        /* ---------------------------
           7. Install Dependencies & Run Tests
        ---------------------------- */
        stage('Run Mocha Tests') {
            steps {
                sh '''
                    cd mocha-tests

                    echo "Installing test dependencies..."
                    npm install

                    echo "Running Mocha tests..."
                    npx mocha tests --reporter mocha-junit-reporter --reporter-options mochaFile=results.xml
                '''
            }
        }

        /* ---------------------------
           8. Archive Test Reports
        ---------------------------- */
        stage('Archive Test Results') {
            steps {
                junit 'mocha-tests/results.xml'
            }
        }
    }

    /* ---------------------------
       POST BUILD
    ---------------------------- */
    post {
        success {
            echo '✔ SUCCESS: MERN App Deployed + Mocha Tests Passed'
        }
        failure {
            echo '✘ FAILURE: Something Failed — Check Jenkins Logs'
        }
    }
}




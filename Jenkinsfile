pipeline {
    agent any

    // ============================
    // 1. DEFINE TOOLS BLOCK HERE
    // This loads the node18 binary into the PATH for all stages.
    // ============================
    tools {
        nodejs 'node18' 
    }

    environment {
        COMPOSE_PROJECT_NAME = "mern_ci_app"
        // Initialize Committer Email environment variable
        COMMIT_EMAIL = ""
    }

    stages {

        /* ============================
           CHECKOUT MAIN MERN PROJECT
        =============================*/
        stage('Checkout MERN App') {
            steps {
                echo 'Cloning MERN App...'
                // Using a public repo, no credentials needed here
                git branch: 'main',
                    url: 'https://github.com/A5tab/E-Commerce-Docker-Container.git'

                script {
                    // IMPORTANT: Extract commit email for notifications
                    env.COMMIT_EMAIL = sh(
                        script: "git log -1 --pretty=format:'%ae'",
                        returnStdout: true
                    ).trim()
                    echo "Committer: ${env.COMMIT_EMAIL}"
                }
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
                // You should use a simple shell script for this.
                sh '''
                    echo "Checking backend..."
                    # Check backend (Port 4000)
                    for i in {1..10}; do
                        curl -s http://localhost:4000 && echo "Backend is up!" && break
                        echo "Retry $i..."
                        sleep 5
                    done

                    echo "Checking frontend..."
                    # Check frontend (Port 8085)
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
        /* ============================
   CHECKOUT TEST REPO
=============================*/
stage('Checkout Tests') {
    steps {
        // 🎯 FIX: ADD THE 'dir' WRAPPER
        dir('tests') { 
            // This checks out MERN_Test into /workspace/job-name/tests/
            git branch: 'main', url: 'https://github.com/A5tab/MERN_Test.git'
        }
    }
}

     stage('Run Tests') {
    steps {
        nodejs('node18') {
            sh '''
                cd tests
                
                # 🎯 FIX: CLEANUP BEFORE INSTALL
                # 1. Remove the node_modules folder entirely
                rm -rf node_modules
                # 2. Clear the npm cache (good practice for corrupted installs)
                npm cache clean --force
                
                npm install
                npm test
            '''
        }
    }
}

        stage('Archive Reports') {
            steps {
                // Ensure the path is correct relative to the workspace root
                junit 'tests/results.xml'
            }
        }

    } // end stages

    /* ============================
       EMAIL NOTIFICATIONS (Fixed to use standard recipient field)
    =============================*/
    post {
        // Ensure email is sent using the environment variable defined earlier
        always {
            emailext (
                to: "${env.COMMIT_EMAIL}",
                subject: "${currentBuild.currentResult}: Jenkins MERN Pipeline Build #${env.BUILD_NUMBER}",
                body: """
                    Build Status: ${currentBuild.currentResult}
                    Committer: ${env.COMMIT_EMAIL}
                    View Build Details: ${env.BUILD_URL}
                """
            )
        }
    }
}

pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "mern_ci_app"
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

                script {
                    // very important: declare variable
                    env.COMMIT_EMAIL = sh(
                        script: "git log -1 --pretty=format:'%ae'",
                        returnStdout: true
                    ).trim()
                    echo "Committer: ${env.COMMIT_EMAIL}"
                }
            }
        }

        /* ============================
           DOCKER READY CHECK
        =============================*/
        stage('Check Docker Environment') {
            steps {
                sh '''
                    echo "Docker Version:"
                    docker --version
                    docker compose version
                '''
            }
        }

        /* ============================
           CLEAN OLD CONTAINERS
        =============================*/
        stage('Clean Containers') {
            steps {
                sh '''
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
                sh '''
                    docker compose build
                    docker compose up -d
                '''
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
                        curl -s http://localhost:4000 && break
                        echo "Retry $i..."
                        sleep 5
                    done

                    echo "Checking frontend..."
                    for i in {1..10}; do
                        curl -s http://localhost:8085 && break
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
                }
            }
        }

        /* ============================
           RUN MOCHA TESTS
        =============================*/
        stage('Run Tests') {
            steps {
                sh '''
                    cd tests
                    npm install
                    npx mocha tests --reporter mocha-junit-reporter --reporter-options mochaFile=results.xml
                '''
            }
        }

        stage('Archive Reports') {
            steps {
                junit 'tests/results.xml'
            }
        }

    } // end stages

    /* ============================
       EMAIL NOTIFICATIONS
    =============================*/
    post {
        success {
            emailext(
                to: "${env.COMMIT_EMAIL}",
                subject: "Jenkins ✔ SUCCESS: MERN Deployment",
                body: "Your commit passed tests and was deployed.\nBuild: ${env.BUILD_URL}"
            )
        }

        failure {
            emailext(
                to: "${env.COMMIT_EMAIL}",
                subject: "Jenkins ✘ FAILURE: MERN Pipeline",
                body: "Your commit caused the pipeline to FAIL.\nBuild: ${env.BUILD_URL}"
            )
        }
    }
}

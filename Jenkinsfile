pipeline {
    agent any

    triggers {
        // Automatically triggers the build when a push event is received from GitHub
        githubPush()
    }
    
    environment {
        JWT_SECRET = credentials('yesen-jwt-secret')
        MONGODB_URI = credentials('yesen-mongodb-uri')
    }

    stages {
        stage('Checkout Both Repositories') {
            parallel {
                stage('Checkout Backend') {
                    steps {
                        // This checks out the current backend repo where the Jenkinsfile lives
                        checkout scm
                    }
                }
                stage('Checkout Frontend') {
                    steps {
                        // Replace with your actual frontend repository URL and branch
                        git branch: 'main', 
                            url: 'https://github.com/UdaykumarBijinepalli/yesen-crm-frontend',
                            credentialsId: 'github-pat-token'
                    }
                }
            }
        }

        stage('Build & Test Backend') {
            steps {
                // Since Jenkins checks out the backend into the root workspace by default in this mode:
                echo 'Installing backend dependencies...'
                sh 'npm install'
                
                echo 'Running backend smoke tests...'
                sh 'node smoke-test.js || true'
            }
        }

        stage('Build Frontend') {
            steps {
                // Point to the cloned frontend folder directory
                dir('yesen-crm-frontend-main') {
                    echo 'Installing frontend dependencies using pnpm...'
                    sh 'pnpm install'
                    
                    echo 'Building frontend production bundle...'
                    sh 'pnpm run build'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application services...'
                sh '''
                    # Restart backend via PM2
                    export PORT=5000
                    export MONGODB_URI="${MONGODB_URI}"
                    export JWT_SECRET="${JWT_SECRET}"
                    
                    if pm2 list | grep -q "yesen-backend"; then
                        pm2 restart yesen-backend
                    else
                        pm2 start src/server.js --name "yesen-backend"
                    fi

                    # Copy frontend build files to web directory
                    sudo mkdir -p /var/www/yesen-crm
                    sudo rm -rf /var/www/yesen-crm/*
                    sudo cp -r yesen-crm-frontend-main/dist/* /var/www/yesen-crm/
                '''
            }
        }
    }
}

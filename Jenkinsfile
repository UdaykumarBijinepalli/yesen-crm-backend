pipeline {
    agent any

    triggers {
        // Automatically triggers the build when a push event is received from GitHub
        githubPush()
    }
    
    environment {
        JWT_SECRET = credentials('yesen-jwt-secret')
        MONGODB_URI = credentials('yesen-mongodb-uri')
        PNPM_HOME = "${WORKSPACE}/.pnpm-home"
        HOME = "${WORKSPACE}"
    }

    stages {
        stage('Checkout Both Repositories') {
            parallel {
                stage('Checkout Backend') {
                    steps {
                        checkout scm
                    }
                }
                stage('Checkout Frontend') {
                    steps {
                        git branch: 'main', 
                            url: 'https://github.com/UdaykumarBijinepalli/yesen-crm-frontend.git',
                            credentialsId: 'github-pat-token'
                    }
                }
            }
        }

        stage('Build & Test Backend') {
            steps {
                echo 'Installing backend dependencies...'
                sh 'npm install'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('yesen-crm-frontend') {
                    echo 'Configuring pnpm environment...'
                    sh 'mkdir -p ${PNPM_HOME}'
                    
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
                    # Start or restart backend via PM2 using the correct path from root
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
                    sudo cp -r yesen-crm-frontend/dist/* /var/www/yesen-crm/
                '''
            }
        }
    }
}

pipeline {
    agent any
    triggers {
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
                        // Jenkins automatically checks out the main SCM repo (backend) here
                        checkout scm
                    }
                }
                stage('Checkout Frontend') {
                    steps {
                        dir('yesen-crm-frontend') {
                            git branch: 'main', 
                                url: 'https://github.com/UdaykumarBijinepalli/yesen-crm-frontend.git',
                                credentialsId: 'github-pat-token'
                        }
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
                    export PORT=5000
                    export MONGO_URI="${MONGODB_URI}"
                    export JWT_SECRET="${JWT_SECRET}"
                    export FORMS_API_KEY="change_this_forms_key_min_8_chars"
                    
                    # Ensure runtime folders exist with proper permissions
                    mkdir -p ${WORKSPACE}/uploads ${WORKSPACE}/logs
                    chmod -R 777 ${WORKSPACE}/uploads ${WORKSPACE}/logs

                    # Stop/Delete old PM2 process if running
                    pm2 delete yesen-backend || true
                    
                    # Start backend via PM2 using src/server.js
                    pm2 start src/server.js --name "yesen-backend"

                    # Copy frontend build files to Nginx web directory
                    sudo mkdir -p /var/www/yesen-crm
                    sudo rm -rf /var/www/yesen-crm/*
                    
                    if [ -d "${WORKSPACE}/yesen-crm-frontend/dist" ]; then
                        sudo cp -r ${WORKSPACE}/yesen-crm-frontend/dist/* /var/www/yesen-crm/
                        echo "Frontend deployed successfully!"
                    else
                        echo "Error: Frontend dist folder not found!"
                        exit 1
                    fi
                '''
            }
        }
    }
}

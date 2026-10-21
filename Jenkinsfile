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
                    export MONGODB_URI="${MONGODB_URI}"
                    export JWT_SECRET="${JWT_SECRET}"
                    
                    # Start or restart backend directly via PM2 using server.js
                    if pm2 list | grep -q "yesen-backend"; then
                        pm2 restart yesen-backend
                    else
                        pm2 start src/server.js --name "yesen-backend"
                    fi

                    # Copy frontend build files to Nginx web directory automatically
                    sudo mkdir -p /var/www/yesen-crm
                    sudo rm -rf /var/www/yesen-crm/*
                    
                    # Automatically find the built dist folder anywhere in the workspace and copy its contents
                    DIST_PATH=$(find ${WORKSPACE} -type d -name "dist" | grep -v "node_modules" | head -n 1)
                    if [ -d "$DIST_PATH" ]; then
                        sudo cp -r ${DIST_PATH}/* /var/www/yesen-crm/
                        echo "Frontend deployed successfully from $DIST_PATH!"
                    else
                        echo "Error: Frontend dist folder not found!"
                        exit 1
                    fi
                '''
            }
        }
    }
}

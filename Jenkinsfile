pipeline {
    agent any

    environment {
        CI = 'true'
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.playwright-cache"
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm-cache"
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci --prefer-offline'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint:check'
            }
        }

        stage('Format Check') {
            steps {
                sh 'npm run format:check'
            }
        }

        stage('Install Browsers') {
            steps {
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npx playwright test'
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh 'npx allure generate allure-results --clean -o allure-report'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**, allure-results/**, allure-report/**', allowEmptyArchive: true
            cleanWs()
        }
        failure {
            echo 'Tests failed. Check artifacts for details.'
        }
    }
}

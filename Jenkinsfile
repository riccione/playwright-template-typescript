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

        stage('Typecheck') {
            steps {
                sh 'npm run typecheck'
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

        stage('Merge Playwright Reports') {
            steps {
                sh 'npx playwright merge-reports --reporter html ./blob-report'
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
            archiveArtifacts artifacts: 'playwright-report/**, allure-results/**, allure-report/**', allowEmptyArchive: true
            cleanWs()
        }
        failure {
            echo 'Tests failed. Check artifacts for details.'
        }
    }
}

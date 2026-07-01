pipeline {
    agent any

    environment {
        CI = 'true'
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
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
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**, allure-results/**', allowEmptyArchive: true
            cleanWs()
        }
        failure {
            echo 'Tests failed. Check artifacts for details.'
        }
    }
}

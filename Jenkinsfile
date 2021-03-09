@Library('jenkins-pipeline') _
import com.figure.Common

def common
pipeline {
    agent { label 'autoscale-nodejs' }
    environment {
      NODE_CONTAINER = "node12"
    }

    stages {
        stage('Stage Checkout') {
            steps {
                script {
                    common = new Common(this)
                }
                gitCheckout()
            }
        }
        stage('Npm Install') {
            steps {
                container("${NODE_CONTAINER}") {
                    npmInstall()
                }
            }
        }
        stage('Npm Build') {
            steps {
                container("${NODE_CONTAINER}") {
                    npmRun('build')
                }
            }
        }
        stage('Npm Publish') {
            steps {
                script {
                    if (env.BRANCH_NAME == "master") {
                        container("${NODE_CONTAINER}") {
                            npmPublish()
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                rmrf('lib', 'node_modules')
            }
        }
    }
}

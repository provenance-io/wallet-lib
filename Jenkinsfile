@Library('jenkins-pipeline') _
import com.figure.Common

def common
pipeline {
    agent { label 'autoscale-nodejs' }
    environment {
      NODE_CONTAINER = "node12"
      PROTOC_ZIP = "protoc-3.15.8-linux-x86_64.zip"
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
        stage('Install Protoc') {
            steps {
                container("${NODE_CONTAINER}") {
                    sh "curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v3.15.8/${PROTOC_ZIP}"
                    sh "unzip -o ${PROTOC_ZIP} -d /usr/local bin/protoc"
                    sh "unzip -o ${PROTOC_ZIP} -d /usr/local 'include/*'"
                }
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

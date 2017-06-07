import promisify from 'es6-promisify'
import childProcess from 'child_process'

const exec = promisify(childProcess.exec)

class DefaultEnvironment {
    dockerTags() {
        const currentBrach = exec('git symbolic-ref --short HEAD')
        const currentCommit = exec('git rev-parse --short HEAD')
        return Promise.all([currentBrach, currentCommit])
    }
}

class TravisEnvironment extends DefaultEnvironment {
    dockerTags() {
        return super.dockerTags()
            .then(tags => {
                tags.push(`travis-build-${process.env.TRAVIS_BUILD_NUMBER}`)
                return tags
            })
    }
}

let environment = new DefaultEnvironment()
if (process.env.TRAVIS) {
    environment = new TravisEnvironment()
}

export default environment

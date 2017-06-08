import promisify from 'es6-promisify'
import childProcess from 'child_process'

const exec = promisify(childProcess.exec)

class DefaultEnvironment {
    constructor(baseTag) {
        this.baseTag = baseTag
    }

    makeTag(tag) {
        return `${this.baseTag}:${tag.replace('\n', '')}`
    }

    get commitTag() {
        return exec('git rev-parse --short HEAD')
            .then(commitHash => this.makeTag(`commit-${commitHash}`))
            .catch(err => {
                // Swallow errors because, for some reason, the commands runs twice and fails the second time
            })
    }

    get branchTag() {
        return exec('git symbolic-ref --short HEAD')
            .then(branch => this.makeTag(`branch-${branch}`))
    }

    dockerTags() {
        return Promise.all(this.branchTag, this.commitTag)
    }
}

class TravisEnvironment extends DefaultEnvironment {
    dockerTags() {
        return super.dockerTags()
            .then(tags => {
                tags.push(this.makeTag(`travis-build-${process.env.TRAVIS_BUILD_NUMBER}`))
                return tags
            })
    }
}

let environment = DefaultEnvironment
if (process.env.TRAVIS) {
    environment = TravisEnvironment
}

export default environment

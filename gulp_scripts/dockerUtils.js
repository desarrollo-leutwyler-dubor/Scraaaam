import promisify from 'es6-promisify'
import childProcess from 'child_process'

class DefaultUtils {
    constructor(username, repo) {
        this.username = username
        this.repo = repo
        this.exec = promisify(childProcess.exec)
    }

    makeTag(tag) {
        return `${this.repo}:${tag.replace('\n', '').replace('/', '-')}`
    }

    cacheCommand(property, command, defaultValue, retries) {
        if (retries === undefined) {
            retries = 2
        }
        if (!this[`_${property}`]) {
            return this.exec(command)
                .then(returnValue => {
                    this[`_${property}`] = returnValue
                    return returnValue
                })
                .catch(err => {
                    if (retries === 0) {
                        console.log(err.message)
                        this[`_${property}`] = defaultValue
                        return defaultValue
                    }
                    // Retry on error because, for some reason, the command sometimes fails randomly
                    return this.cacheCommand(property, command, defaultValue, retries - 1)
                })
        } else {
            return Promise.resolve(this[`_${property}`])
        }
    }

    get commitTag() {
        return this.cacheCommand('commitTag', 'git rev-parse --short HEAD', 'no-hash')
            .then(commitHash => this.makeTag(`commit-${commitHash}`))
    }

    get branchTag() {
        return this.cacheCommand('branchTag', 'git symbolic-ref --short HEAD', 'no-branch')
            .then(branch => this.makeTag(`branch-${branch}`))
    }

    get dockerTags() {
        return Promise.all([this.branchTag, this.commitTag])
    }

    get login() {
        return this.exec(
            `docker login -e ${process.env.DOCKER_EMAIL} -u ${process.env.DOCKER_USER} -p ${process.env.DOCKER_PASS}`
        )
    }

    tagAndPush(sourceTag, tag) {
        const pushTag = `${this.username}/${tag}`
        return this.exec(`docker tag ${sourceTag} ${pushTag}`)
            .then(() => this.exec(`docker push ${pushTag}`))
            .then(() => console.log(`Sucessfully pushed ${pushTag}`))
    }
}

class TravisUtils extends DefaultUtils {
    constructor(username, repo) {
        super(username, repo)
        this.specialBranches = [
            this.makeTransform('master', 'latest'),
            this.makeTransform('dev', 'develop')
        ]
    }

    makeTransform(branchName, tag) {
        return tags => {
            if (this.sourceBranch === branchName) {
                tags.push(this.makeTag(tag))
            }
        }
    }

    get dockerTags() {
        return super.dockerTags
            .then(tags => {
                tags.push(this.makeTag(`travis-build-${process.env.TRAVIS_BUILD_NUMBER}`))
                this.specialBranches.forEach(fun => fun(tags))
                return tags
            })
    }

    get branchTag() {
        return Promise.resolve(this.makeTag(`branch-${this.sourceBranch}`))
    }

    get sourceBranch() {
        const isPR = process.env.TRAVIS_PULL_REQUEST
        return isPR === 'false' ? process.env.TRAVIS_BRANCH : process.env.TRAVIS_PULL_REQUEST_BRANCH
    }
}

let dockerUtils = DefaultUtils
if (process.env.TRAVIS) {
    dockerUtils = TravisUtils
}

export default dockerUtils

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

    get commitTag() {
        return this.exec('git rev-parse --short HEAD')
            .then(commitHash => this.makeTag(`commit-${commitHash}`))
            .catch(err => {
                // Swallow errors because, for some reason, the commands runs twice and fails the second time
            })
    }

    get branchTag() {
        return this.exec('git symbolic-ref --short HEAD')
            .then(branch => this.makeTag(`branch-${branch}`))
            .catch(err => {
                // Swallow errors because, for some reason, the commands runs twice and fails the second time
            })
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
    get dockerTags() {
        return super.dockerTags()
            .then(tags => {
                tags.push(this.makeTag(`travis-build-${process.env.TRAVIS_BUILD_NUMBER}`))
                return tags
            })
    }
}

let dockerUtils = DefaultUtils
if (process.env.TRAVIS) {
    dockerUtils = TravisUtils
}

export default dockerUtils

'use strict';

require("babel-core/register");
require("babel-polyfill");

import promisify from 'es6-promisify'
import childProcess from 'child_process'

const exec = promisify(childProcess.exec)

function travisDockerTags() {
    return defaultDockerTags()
        .then(tags => {
            tags.push(`travis-build-${process.env.TRAVIS_BUILD_NUMBER}`)
            return tags
        })
}

function defaultDockerTags() {
    const currentBrach = exec('git symbolic-ref --short HEAD')
    const currentCommit = exec('git rev-parse --short HEAD')
    return Promise.all([currentBrach, currentCommit])
}

export default {
    async dockerTags() {
        if (process.env.TRAVIS) {
            return await travisDockerTags()
        }
        return await defaultDockerTags()
    }
}

import Docker from 'dockerode'
import * as fs from 'fs'
import * as path from 'path'
import tar from 'tar-fs'
import * as zlib from 'zlib'

class GulpDockerClient extends Docker {
    constructor(opts) {
        super(opts || {socketPath: '/var/run/docker.sock'})
    }

    buildImage(context, tag) {
        return () => Promise.resolve(tag)
            .then(tag => super.buildImage(this.srcFiles(context), {t: tag}))
            .then(output => {
                output.setEncoding('UTF-8')
                output.on('data', data => console.log(JSON.parse(data).stream.slice(0, -1)))
                return new Promise(resolve => output.on('end', resolve))
            })
    }

    srcFiles(context) {
        let dockerInclude = fs.readFileSync(path.join(context, '.dockerignore'), 'UTF-8')
            .split('\n')
            .filter(line => line.startsWith('!'))
            .map(line => line.substr(1))
        dockerInclude.push('Dockerfile')
        dockerInclude = dockerInclude.map(line => path.join(context, line))
        const tarFile = tar.pack(context, {
            ignore: name => !dockerInclude.some(file => name.startsWith(file))
        })
        return tarFile.pipe(zlib.createGzip())
    }

    pushWith(utils) {
        return () => Promise.all([utils.commitTag, utils.dockerTags, utils.login])
            .then(([imageName, tags, _]) => {
                return Promise.all(tags.map(tag => utils.tagAndPush(imageName, tag)))
            })
    }
}

export default GulpDockerClient

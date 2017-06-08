import Docker from 'dockerode'
import * as fs from 'fs'
import * as path from 'path'
import tar from 'tar-fs'
import * as zlib from 'zlib'

class DockerClient {
    constructor(context, opts) {
        this.docker = new Docker(opts || {socketPath: '/var/run/docker.sock'});
        this.context = context
    }

    buildImage() {
        function buildImage() {
            return this.docker.buildImage(this.srcFiles, {t: 'sarasa'})
                .then(output => {
                    output.setEncoding('UTF-8')
                    output.on('data', data => console.log(JSON.parse(data).stream.slice(0, -1)))
                    return new Promise(resolve => output.on('end', resolve))
                })
        }

        return buildImage.bind(this)
    }

    get srcFiles() {
        let dockerInclude = fs.readFileSync(path.join(this.context, '.dockerignore'), 'UTF-8')
            .split('\n')
            .filter(line => line.startsWith('!'))
            .map(line => line.substr(1))
        dockerInclude.push('Dockerfile')
        dockerInclude = dockerInclude.map(line => path.join(this.context, line))
        const tarFile = tar.pack(this.context, {
            ignore: name => !dockerInclude.some(file => name.startsWith(file))
        })
        return tarFile.pipe(zlib.createGzip())
    }
}

export default DockerClient


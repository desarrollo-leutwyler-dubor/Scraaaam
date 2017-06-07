import Docker from 'dockerode'
import * as fs from 'fs'
import * as path from 'path'

class DockerClient {
    constructor(context, opts) {
        this.docker = new Docker(opts || {socketPath: '/var/run/docker.sock'});
        this.context = context
    }

    buildImage() {
        function buildImage() {
            return this.docker.buildImage({
                context: this.context,
                src: this.srcFiles
            }, {t: 'sarasa'})
                .then(output => {
                    output.pipe(process.stdout)
                    return output
                })
        }

        return buildImage.bind(this)
    }

    get srcFiles() {
        const dockerInclude = fs.readFileSync(path.join(this.context, '.dockerignore'), 'UTF-8')
            .split('\n')
            .filter(line => line.startsWith('!'))
            .map(line => line.substr(1))
        const folders = []
        const files = ['Dockerfile']
        dockerInclude.forEach(entry => entry.startsWith('/') ? folders.push(entry) : files.push(entry))
        console.log(folders)
        console.log(files)
        return files
    }
}

export default DockerClient


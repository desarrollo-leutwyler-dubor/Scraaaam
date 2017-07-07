'use strict';

import gulp from 'gulp'
import {lintTask} from './gulp_scripts/lintTask'
import {hotServer, transpile} from './gulp_scripts/server'
import {backend_tests} from './gulp_scripts/backendTests'
import {frontend_components_tests} from './gulp_scripts/components'
import {initProtractor} from './gulp_scripts/protractor'
import {webpack} from './gulp_scripts/webpack'
import GulpDockerClient from './gulp_scripts/gulpDockerClient'
import DockerUtils from './gulp_scripts/dockerUtils'
import run from 'gulp-run'

const dirs = {
    src: 'src',
    dist: 'dist',
    test: 'test'
};

gulp.task('lint', lintTask(dirs.src));

gulp.task('transpile', transpile(dirs.src, dirs.dist));

gulp.task('webpack', webpack(dirs.src, dirs.dist));

gulp.task('build', ['transpile', 'webpack']);

gulp.task('hot-server', ['build'], hotServer(dirs.src, dirs.dist));

gulp.task('backend-test', backend_tests(dirs.test));

gulp.task('frontend-components-test', frontend_components_tests(__dirname));

gulp.task('frontend-e2e-test', initProtractor(dirs.src));

gulp.task('frontend-all', ['frontend-components-test', 'frontend-e2e-test']);

gulp.task('all-non-e2e', ['frontend-components-test', 'backend-test']);

gulp.task('coverage', () => run('npm run coverage').exec());

const dockerUtils = new DockerUtils('desarrolloleutwylerdubor', 'scraaaam')

const dockerClient = new GulpDockerClient(dockerUtils.dockerOpts)

gulp.task('docker-build', dockerClient.buildImage(__dirname, dockerUtils.commitTag));

gulp.task('docker-push', ['docker-build'], dockerClient.pushWith(dockerUtils))

gulp.task('e2e-test', () => run(
    'docker-compose -f test/e2e/docker-compose.e2e-test.yml stop && ' +
    'docker-compose -f test/e2e/docker-compose.e2e-test.yml rm -fv mongo && ' +
    'docker-compose -f test/e2e/docker-compose.e2e-test.yml build && ' +
    'docker-compose -f test/e2e/docker-compose.e2e-test.yml run test').exec())

gulp.task('niffy-test', () => {
    try{ run(
        'docker-compose -f test/perceptual/docker-compose.niffy-test.yml stop && ' +
        'docker-compose -f test/perceptual/docker-compose.niffy-test.yml rm -fv mongo && ' +
        'docker-compose -f test/perceptual/docker-compose.niffy-test.yml build && ' +
        'docker-compose -f test/perceptual/docker-compose.niffy-test.yml run test && ' +
        `curl --user '${process.env.GITHUB_USER}:${process.env.GITHUB_PASS}' --request POST --data '{"body":"testing"}'`
      ).exec()
      }
    catch(err){}
  })

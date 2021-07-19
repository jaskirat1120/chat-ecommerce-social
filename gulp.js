// npm modules
const gulp = require('gulp');
const clear = require('clear');
const eslint = require('gulp-eslint');

gulp.task('clear', function () { // clear the console
    clear();
    console.log('AR Project.');
});

gulp.task('lint', function () {
    return gulp.src([
        './config/**/*.js',
        './dao/**/*.js',
        './lib/**/*.js',
        './models/**/*.js',
        './plugins/**/*.js',
        './src/**/*.js',
        './test/**/*.js',
        './utils/**/*.js'
    ]).pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('watch', function () { // watch for js changes, and run lint
    return gulp.watch([
        '.env',
        './config/**/*.js',
        './dao/**/*.js',
        './lib/**/*.js',
        './models/**/*.js',
        './plugins/**/*.js',
        './api/**/*.js',
        './test/**/*.js',
        './utils/**/*.js'
    ], ['clear', 'lint']);
});

gulp.task('default', ['clear', 'lint', 'watch']);

var path = require('path');
var gulp = require('gulp');
var del = require('del');
var merge = require('merge2');
var ts = require('gulp-typescript');



gulp.task('clean', function () {
    return del([
		'definitions/',
        'test/',
        'lib/',
		'./test/**/*.js',
        './src/**/*.js',
        './src/**/*.d.ts',
        './index.js'
    ]);

});


gulp.task('ts', ['clean'], function () {
    var tsProject = ts.createProject(path.resolve('./tsconfig.json'));
    var tsResult = gulp.src(['./src/**/*.ts', '!./src/test/**']).pipe(tsProject());
    return merge([
        tsResult.dts.pipe(gulp.dest('./definitions')),
        tsResult.js.pipe(gulp.dest(path.resolve('./')))
    ]);

});


gulp.task('test', ['ts'], function () {
    var tsProject = ts.createProject(path.resolve('./tsconfig.json'));
    var tsResult = gulp.src(['./src/test/**']).pipe(tsProject());
    tsResult.js.pipe(gulp.dest(path.resolve('./test')))
});



gulp.task('build', ['test']);
gulp.task('default', ['build']);
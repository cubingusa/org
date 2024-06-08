import * as gulp from 'gulp';
import * as gulpBrowser from 'gulp-browser';
import reactify from 'reactify';
import * as del from 'del';
import size from 'gulp-size';

gulp.task('transform', function(cb) {
  return gulp.src('./app/jsx/**/*.js')
    .pipe(gulpBrowser.browserify({transform: ['reactify']}))
    .pipe(gulp.dest('./app/static/js/react'))
    .pipe(size());
});

gulp.task('del', function(cb) {
  del.deleteSync(['./app/static/js/react']);
  cb();
});

gulp.task('watch', function(cb) {
  gulp.watch('./app/jsx/**/*.js', gulp.series('del', 'transform'));
  cb();
});

gulp.task('default', gulp.series('del', 'transform', 'watch'), function(cb) {
  gulp.watch('./app/jsx/**/*.js', function(cb) {
    gulp.series('del', 'transform');
    cb();
  });
});

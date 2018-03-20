const gulp = require('gulp')
const sass = require('gulp-sass')
const babel = require('gulp-babel')

const sources = {
  sass: 'build/src/styles/**/*.scss',
  js: 'build/src/scripts/**/*.js'
}
const outputDir = 'dist'

// Copy files
gulp.task('copy', () => {
  gulp.src('build/src/images/*')
  .pipe(gulp.dest(`${outputDir}/images`))
})

// copy fonts
gulp.task('fonts', () => {
  gulp.src('build/src/fonts/*')
  .pipe(gulp.dest(`${outputDir}/fonts`))
})

// Compile sass to css, move to dist and reload
gulp.task('sass', () => {
  return gulp.src('build/src/styles/main.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest(`${outputDir}/css`))
})

// Convert to es5, uglify and move js files
gulp.task('js', () => {
  return gulp.src(sources.js)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest(`${outputDir}/js`))
})

// Watch html, sass and js
gulp.task('watch', () => {
  gulp.watch(sources.html, ['html', 'copy'])
  gulp.watch(sources.sass, ['sass'])
  gulp.watch(sources.js, ['js'])
})

gulp.task('default', ['copy', 'sass', 'js', 'watch'])

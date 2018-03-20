const gulp = require('gulp')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const nodemon = require('gulp-nodemon')
const connect = require('gulp-connect')
const open = require('gulp-open')

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
    .pipe(connect.reload())
})

// Convert to es5, uglify and move js files
gulp.task('js', () => {
  return gulp.src(sources.js)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest(`${outputDir}/js`))
    .pipe(connect.reload())
})

// Watch html, sass and js
gulp.task('watch', () => {
  gulp.watch(sources.html, ['html', 'copy'])
  gulp.watch(sources.sass, ['sass'])
  gulp.watch(sources.js, ['js'])
})

gulp.task('develop', function () {
  var stream = nodemon({ script: 'app.js',
    ext: 'html js css scss',
    ignore: ['ignored.js']
  })
  stream
  .on('restart', () => {
    console.log('restarted!')
  })
  .on('crash', () => {
    console.error('Application has crashed!\n')
    stream.emit('restart', 10)  // restart the server in 10 seconds
  })
})

// Start server
gulp.task('connect', () => {
  connect.server({
    name: 'App',
    root: 'app',
    port: 8001,
    livereload: true
  })
})

// Open browser
gulp.task('open', () => {
  gulp.src('')
  .pipe(open({uri: 'http://localhost:8001'}))
})

gulp.task('default', ['copy', 'sass', 'js', 'watch', 'develop', 'connect'])

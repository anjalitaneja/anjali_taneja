const gulp = require('gulp');

const plumber = require('gulp-plumber'); // for error handling during 'watch' task
const del = require('del'); // for clearing out dist/assets to stay up-to-date with changes to src/assets
const sourcemaps = require('gulp-sourcemaps'); // for creating sourcemaps of css and js
const concat = require('gulp-concat'); // for combining multiple files into one file
const sass = require('gulp-sass'); // for compiling Sass into css
const cssnano = require('gulp-cssnano'); // for minifying css
const minify = require('gulp-babel-minify'); // for minifying js
const htmlReplace = require('gulp-html-replace'); // for editing specific lines of html between src and dist
const browserSync = require('browser-sync'); // for automatic reloading of page in browser, and for viewing page on multiple devices
const imagemin = require('gulp-imagemin'); // minify png, jpeg, gif, and svg

const { reload } = browserSync; // see browserSync above

// compiles sass to css.
gulp.task('scss', () => {
  gulp.src('src/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('src/css/'))
    .pipe(reload({ stream: true }));
});

// concatenates and minifies css files.
// IMPORTANT: if you add more css files or folders, gulp.src needs to be updated as well
gulp.task('css', () => {
  const stream = gulp.src([ // add more css files here, in the order you want them to be combined
    'src/css/**/*.css'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('styles.css'))
    .pipe(cssnano())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('css/'))
    .pipe(reload({ stream: true }));

  return stream;
});

// concatenates and minifies all javascript files.
// outputs one file to dist/js folder.
// IMPORTANT: if you add more js files or folders, gulp.src needs to be updated as well
gulp.task('js', () => {
  gulp.src([ // add more js files here, in the order you want them to be combined
    'src/js/init.js',
    'src/js/components/navbar.js',
    'src/js/components/smoothscroll.js',
    'src/js/main.js',
  ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(minify())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('js'))
    .pipe(reload({ stream: true }));
});

// Changes the script and link tags in index.html to preserve refences
// to .css and .js files after the above tasks run.
// outputs one .html file to dist folder
// IMPORTANT: if you add more html files or folders, gulp.src needs to be updated as well
gulp.task('html', () => {
  gulp.src('src/index.html')
    .pipe(plumber())
    .pipe(htmlReplace({
      css: '<link rel="stylesheet" href="css/styles.css">',
      js: '<script src="js/app.min.js" defer></script>',
    }))
    .pipe(gulp.dest(''))
    .pipe(reload({ stream: true }));
});

// clears assets folder before copying new assets from src/assets
// runs when 'assets' is called
gulp.task('cleanfolder', () => del(['assets/**']));

// copies new/changed assets into dist/assets
// when called, runs 'cleanfolder' first
gulp.task('assets', ['cleanfolder'], () => {
  const stream = gulp.src(['src/assets/**/*'])
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest('assets'))
    .pipe(reload({ stream: true }));

  return stream;
});

// watches src directory and handles hot-reloading in browser
// also allows for viewing webiste on multiple devices
// baseDir can be changed to './src' if you want to watch the src directory instead
gulp.task('browser-sync', () => {
  browserSync({
    server: {
      baseDir: '',
    },
  });
});

// watches all src folders for changes to files
gulp.task('watch', () => {
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/scss/**/*.scss', ['scss']);
  gulp.watch('src/css/**/*.css', ['css']);
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/assets/**/*', ['assets']);
});

// default task that runs when you type 'gulp' in command line
gulp.task('default', ['browser-sync', 'js', 'scss', 'css', 'html', 'assets', 'watch']);

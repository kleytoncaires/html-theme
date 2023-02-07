const gulp = require('gulp');
const { parallel, series } = require('gulp');

const uglify = require('gulp-uglify');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const sort = require('gulp-sort');

// /*
// TOP LEVEL FUNCTIONS
//     gulp.task = Define tasks
//     gulp.src = Point to files to use
//     gulp.dest = Points to the folder to output
//     gulp.watch = Watch files and folders for changes
// */

// JS task: concatenates and uglifies JS files to script.js
function js(cb) {
	gulp.src('./assets/js/*js', { sourcemaps: true })
		.pipe(
			babel({
				presets: ['@babel/preset-env'],
			})
		)
		.pipe(concat('script.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./', { sourcemaps: '.' }));
	cb();
}

// SCSS task: compiles the style.scss file into style.css
function css(cb) {
	gulp.src('./assets/css/*.scss', { sourcemaps: true })
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(
			autoprefixer({
				browserlist: ['last 2 versions'],
				cascade: false,
			})
		)
		.pipe(gulp.dest('./', { sourcemaps: '.' }));
	cb();
}

// Copy Task: copy scripts to vendor
function copy(cb) {
	gulp.src([
		'./node_modules/jquery/dist/jquery.min.js',
		'./node_modules/bootstrap/dist/js/bootstrap.bundle.js',
		'./node_modules/jquery-mask-plugin/dist/jquery.mask.min.js',
		'./node_modules/swiper/swiper-bundle.min.js',
		'./node_modules/@fancyapps/ui/dist/fancybox.esm.js',
	]).pipe(gulp.dest('./assets/js/vendor'));
	cb();
}

// Watch Files
function watchFiles() {
	gulp.watch('assets/css/**/*.scss', css);
	gulp.watch('assets/js/*.js', js);
}

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(css, js, watchFiles);

// 'gulp build' will build all assets but not run on a local server.
exports.build = parallel(css, js, copy);

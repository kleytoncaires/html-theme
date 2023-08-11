const themeName = 'theme-name';
const gulp = require('gulp');
const { parallel, series } = require('gulp');

const uglify = require('gulp-uglify');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const wpPot = require('gulp-wp-pot');
const sort = require('gulp-sort');
const path = require('path');
const fs = require('fs');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

// /*
// TOP LEVEL FUNCTIONS
//     gulp.task = Define tasks
//     gulp.src = Point to files to use
//     gulp.dest = Points to the folder to output
//     gulp.watch = Watch files and folders for changes
// */

// Copy Task: copy scripts from node modules to assets/scripts
function copyScripts(cb) {
	const scriptsToCopy = [
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
		'node_modules/jquery-mask-plugin/dist/jquery.mask.min.js',
		'node_modules/@fancyapps/ui/dist/fancybox/fancybox.umd.js',
		'node_modules/swiper/swiper-bundle.min.js',
	];

	gulp.src(scriptsToCopy)
		.pipe(
			plumber({
				errorHandler: notify.onError(
					'Copy Error: <%= error.message %>'
				),
			})
		)
		.pipe(gulp.dest('assets/js/vendor'))
		.on('end', function () {
			console.log('Scripts copied successfully!');
		});

	cb();
}

// JS task: concatenates and uglifies JS files to script.js
function js(cb) {
	const srcPath = 'assets/js';
	const destPath = './';

	const files = fs
		.readdirSync(srcPath)
		.filter((file) => path.extname(file) === '.js');

	files.forEach((file) => {
		gulp.src(path.join(srcPath, file), { sourcemaps: true })
			.pipe(
				plumber({
					errorHandler: notify.onError(
						'JS Error: <%= error.message %>'
					),
				})
			) // Usando gulp-plumber
			.pipe(
				babel({
					presets: ['@babel/preset-env'],
				})
			)
			.pipe(concat(file))
			.pipe(uglify())
			.pipe(gulp.dest(destPath, { sourcemaps: '.' }));
		// .pipe(notify({ message: 'JS processed successfully: ' + file }));
	});

	cb();
}

// SCSS task: compiles the style.scss file into style.css
function css(cb) {
	gulp.src('assets/css/*.scss', { sourcemaps: true })
		.pipe(
			plumber({
				errorHandler: notify.onError('CSS Error: <%= error.message %>'),
			})
		) // Usando gulp-plumber
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(
			autoprefixer({
				browserlist: ['last 2 versions'],
				cascade: false,
			})
		)
		.pipe(gulp.dest('./', { sourcemaps: '.' }));
	// .pipe(notify({ message: 'CSS processed successfully' }));

	cb();
}

// Watch Files
function watchFiles() {
	gulp.watch('assets/css/**/*.scss', css);
	gulp.watch('assets/js/*.js', js);
}

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(css, js, copyScripts, watchFiles);

// 'gulp build' will build all assets but not run on a local server.
exports.build = parallel(css, js);

import browserSync from 'browser-sync'
import fs from 'fs'
import gulp, { parallel, series } from 'gulp'
import autoprefixer from 'gulp-autoprefixer'
import babel from 'gulp-babel'
import concat from 'gulp-concat'
import sass from 'gulp-dart-sass'
import notify from 'gulp-notify'
import plumber from 'gulp-plumber'
import tinypng from 'gulp-tinypng-compress'
import uglify from 'gulp-uglify'
import webp from 'gulp-webp'
import path from 'path'

const srcPath = 'assets/js'
const destPath = './'

const scriptsToCopy = [
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    'node_modules/jquery-mask-plugin/dist/jquery.mask.min.js',
    'node_modules/@fancyapps/ui/dist/fancybox/fancybox.umd.js',
    'node_modules/swiper/swiper-bundle.min.js',
    'node_modules/jquery-validation/dist/jquery.validate.min.js',
    'node_modules/aos/dist/aos.js',
]

function handleErrors() {
    return plumber({
        errorHandler: notify.onError((error) => `Error: ${error.message}`),
    })
}

function js() {
    const files = fs
        .readdirSync(srcPath)
        .filter((file) => path.extname(file) === '.js')

    const jsTasks = files.map((file) => {
        return gulp
            .src(path.join(srcPath, file), { sourcemaps: true })
            .pipe(handleErrors())
            .pipe(babel({ presets: ['@babel/preset-env'] }))
            .pipe(concat(file))
            .pipe(uglify())
            .pipe(gulp.dest(destPath, { sourcemaps: '.' }))
    })

    return Promise.all(jsTasks)
}

function copyScripts(cb) {
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
            console.log('Scripts copied successfully!')
        })

    cb()
}

function css() {
    return gulp
        .src('assets/css/*.scss', { sourcemaps: true })
        .pipe(handleErrors())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(
            autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false,
            })
        )
        .pipe(gulp.dest('./', { sourcemaps: '.' }))
}

function optimizeImages() {
    return gulp
        .src('assets/img/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(
            tinypng({
                key: process.env.TINYPNG_API_KEY,
                sigFile: 'images/.tinypng-sigs',
                log: true,
            })
        )
        .pipe(gulp.dest('assets/img'))
}

function convertToWebP() {
    return gulp
        .src('assets/img/**/*.+(jpg|jpeg|png)')
        .pipe(webp())
        .pipe(gulp.dest('assets/img/webp'))
}

function serve(cb) {
    browserSync.create().init({
        server: {
            baseDir: './',
        },
    })

    gulp.watch('./*.html').on('change', browserSync.reload)
    gulp.watch('./css/*.css').on('change', browserSync.reload)
    gulp.watch('./js/*.js').on('change', browserSync.reload)

    cb()
}

function watchFiles() {
    gulp.watch('assets/css/**/*.scss', css)
    gulp.watch('assets/js/*.js', js)
}

export default series(parallel(css, js), copyScripts, serve, watchFiles)

export const build = parallel(css, js, optimizeImages, convertToWebP)

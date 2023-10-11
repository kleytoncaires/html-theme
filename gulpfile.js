const gulp = require('gulp')
const { parallel, series } = require('gulp')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const fs = require('fs')
const path = require('path')
const webp = require('gulp-webp')
const tinypng = require('gulp-tinypng-compress')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')(require('sass'))
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('gulp-babel')
const ftp = require('vinyl-ftp')
const rename = require('gulp-rename')
const browserSync = require('browser-sync').create()

const srcPath = 'assets/js'
const destPath = './'

const scriptsToCopy = [
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    'node_modules/jquery-mask-plugin/dist/jquery.mask.min.js',
    'node_modules/@fancyapps/ui/dist/fancybox/fancybox.umd.js',
    'node_modules/swiper/swiper-bundle.min.js',
    'node_modules/jquery-validation/dist/jquery.validate.min.js',
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
    browserSync.init({
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

const conn = ftp.create({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    parallel: 10,
    log: console.log,
})

function deploy() {
    return gulp
        .src([
            '**',
            '!node_modules/**',
            '!**/.env',
            '!**/.git',
            '!**/.gitignore',
            '!**/README.md',
        ])
        .pipe(
            rename((path) => {
                path.dirname = path.dirname.replace(/\\/g, '/')
            })
        )
        .pipe(conn.dest(process.env.FTP_PATH))
}

exports.default = series(parallel(css, js), copyScripts, serve, watchFiles)

exports.build = parallel(css, js, optimizeImages, convertToWebP)

exports.deploy = deploy

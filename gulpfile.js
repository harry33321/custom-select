const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-dart-sass');

const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const terser = require('gulp-terser');
const webpack = require('webpack-stream');
const del = require('del');
const mode = require('gulp-mode')();

const concat = require('gulp-concat');
const named = require('vinyl-named');

const php2html = require("gulp-php2html");
const htmlbeautify = require('gulp-html-beautify');

// clean tasks
const clean = () => {
    return del(['dist/assets', 'dist/css', 'dist/js']);
};

// css task
const css = () => {
    return src(['src/scss/*.scss', '!src/scss/pages/*.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(concat('app.min.css'))
        .pipe(mode.production(csso()))
        .pipe(dest('dist/css'));
};

const css_page = () => {
    return src('src/scss/pages/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(
            rename(function (path) {
                return {
                    dirname: path.dirname,
                    basename: path.basename,
                    extname: '.min.css',
                };
            })
        )
        .pipe(mode.production(csso()))
        .pipe(dest('dist/css'));
};

// js task
const js = () => {
    return src(['src/js/pages/*.js', 'src/js/dom/*.js'])
        .pipe(named())
        .pipe(
            babel({
                presets: ['@babel/env'],
                plugins: ['@babel/plugin-proposal-optional-chaining'],
            })
        )
        .pipe(
            webpack({
                mode: 'development',
                devtool: 'inline-source-map',
            })
        )
        .pipe(
            rename(function (path) {
                return {
                    dirname: path.dirname,
                    basename: path.basename,
                    extname: '.min.js',
                };
            })
        )
        .pipe(mode.production(terser({ output: { comments: false } })))
        .pipe(dest('dist/js'));
};

// copy tasks
const copyAssets = () => {
    return src('src/assets/**/*').pipe(dest('dist/assets'));
};

// php to html
const phpGenerator = () => {
    return src(['php/**/*.php', '!php/include_html/**/*'])
        .pipe(php2html())
        .pipe(htmlbeautify())
        .pipe(dest('dist'));
};

// watch task
const watchForChanges = () => {
    watch('src/scss/**/*.scss', css);
    watch('src/scss/**/*.scss', css_page);
    // watch('php/**/*.php', phpGenerator);
    watch('src/**/*.js', js);
    watch('src/assets/**/*', copyAssets);
};

// public tasks
exports.default = series(clean, parallel(css, css_page, js, copyAssets), watchForChanges);
exports.build = series(clean, parallel(css, css_page, js, copyAssets));
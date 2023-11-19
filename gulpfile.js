const { src, dest, watch, series } = require("gulp");
const gulp = require("gulp");
const concat = require("gulp-concat");//використовується для злиття файлів у один
//const sass = require ("gulp-sass");
const sass = require('gulp-sass')(require('sass'));//використовується для компіляції SASS в CSS.
const autoprefixer = require("gulp-autoprefixer");// автоматично додає префікси до CSS-правил
const cssnano = require("gulp-cssnano");//здійснює мініфікацію CSS-файлів
const rename = require("gulp-rename");//дозволяє перейменовувати файли
const uglify = require("gulp-uglify");//мініфікує та зменшує розмір JS-файлів
const pump = require("pump");//замість pipe
const imagemin = require("gulp-imagemin");//використовується для оптимізації зображень
const clean = require('gulp-clean');//використовується для видалення папок або файлів
const browserSync = require("browser-sync").create();//дозволяє автоматично оновлювати сторінку браузера при зміні файлів та використовувати функціонал сервера в режимі розробки
const del = require('del');//використовується для видалення файлив або папок
const fs = require('fs');
var reload = browserSync.reload;
//копіювання HTML файлів в папку dist
function html_task(cb) {
    pump([//метод, який дозволяє працювати з встановленим плагіном
        gulp.src("app/*.html"),
        gulp.dest("dist")
    ],
        cb);
}
exports.html = html_task;
//(У консолі прописуємо: gulp html)
//об'єднання, компіляція Sass в CSS, додавання префіксів і подальша мінімізація коду
function sass_task(cb) {
    pump([
        gulp.src("app/sass/*.scss"),
        concat('style.scss'),
        sass(),
        autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }),
        cssnano(),
        rename({ suffix: '.min' }),
        gulp.dest("dist/css/")
    ],
        cb
    );
}
//gulp.task('sass', sass_task);
exports.sass = sass_task;

//об'єднання і стиснення JS-файлів
function script_task(cb) {
    pump([
        gulp.src("app/js/*.js"),
        concat('index.js'),
        uglify(),
        rename({ suffix: '.min' }),
        gulp.dest('dist/js/')
    ],
        cb
    );
}
//gulp.task("scripts", script_task);
exports.scripts = script_task;
function img_task(cb) {
    pump([
        gulp.src("app/img/*.+(jpg|jpeg|png|gif)"),
        imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true
        }),
        gulp.dest("dist/images/")
    ],
        cb
    );
}
//gulp.task("imgs",img_task);
exports.imgs = img_task;
//(У консолі прописуємо: gulp imgs)
//відстежування за змінами у файлах
function watching() {
    // Serve files from the root of this project
    browserSync.init({
        server: "./app"
    });
    gulp.watch("app/*.html").on("change", reload);
    gulp.watch("app/js/*.js").on("change", reload);
    gulp.watch("app/css/*.css").on("change", reload);
    gulp.watch("app/sass/*.scss").on("change", reload);
    gulp.watch("app/images/*.+(jpg | jpeg | png | gif)").on("change", reload);
    watch("app/*.html", html_task);
    watch("app/js/*.js", script_task);
    watch("app/sass/*.scss", sass_task);
    watch("app/images/*.+(jpg | jpeg | png | gif)", img_task);
}

exports.watch = watching;
gulp.task('clean', function (cb) {
    pump([
        gulp.src("dist/*", { read: false }),
        clean()
    ],
        cb);
});
//(У консолі прописуємо: gulp watch)
//Запуск тасків за замовчуванням
exports.default = series(html_task, sass_task, script_task, img_task, watching);

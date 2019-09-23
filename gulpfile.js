const { src, dest, watch, series, parallel } = require("gulp");
const $ = require("gulp-load-plugins")();
const browserSync = require("browser-sync");

// 刪除 public 資料夾
function clean() {
    return src(["./public"], {
        allowEmpty: true,
        read: false,
    }).pipe($.clean());
}

// 複製非 scss/ 至 public
function copy() {
    return src(["./src/**/**", "!src/**/*.scss"])
        .pipe(dest("./public/"))
        .pipe(
            browserSync.reload({
                stream: true,
            })
        );
}

// 編譯 SCSS
function sass() {
    return src("./src/**/*.scss")
        .pipe($.plumber()) // 讓 Gulp 在運行的過程中遇錯不會中斷
        .pipe($.sass().on("error", $.sass.logError))
        .pipe(dest("./public/"))
        .pipe(
            browserSync.reload({
                stream: true,
            })
        );
}

// 網頁伺服器
function runBrowserSync() {
    browserSync.init({
        server: {
            baseDir: "./public",
        },
        reloadDebounce: 1000, // 設定 reload 時間間隔
    });
}

// 自動發布 public 到 github page
function deploy() {
    return src("./public/**/*").pipe($.ghPages());
}

// 自動監聽檔案變更
function watchFiles() {
    watch("./src/**/*.scss", sass);
    watch("./src/**/*.html", copy);
}

exports.build = series(clean, copy, sass);
exports.deploy = deploy;
exports.default = parallel(copy, sass, runBrowserSync, watchFiles);

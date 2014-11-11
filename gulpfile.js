var gulp = require("gulp")
  , less = require("gulp-less")
  , concat = require("gulp-concat")
  , connect = require("gulp-connect")
  , gif = require("gulp-if")
  , dev = false
  , prefix = require("gulp-autoprefixer")

gulp.task("connect", connect.server({
  port: 1337,
  root: [__dirname],
  livereload: true,
  open: {
    browser: "chromium"
  }
}))

gulp.task("less", function () {
  gulp.src("./less/*.less")
    .pipe(less())
    .pipe(prefix({cascade: true}))
    .pipe(concat("styles.css"))
    .pipe(gulp.dest("./"))
    .pipe(gif(dev, connect.reload()))
})

gulp.task("script", function () {
  gulp.src("./index.js").pipe(connect.reload())
})

gulp.task("html", function () {
  gulp.src("./index.html").pipe(connect.reload())
})

gulp.task("watch", function () {
  gulp.watch(["./index.html"], ["html"])
  gulp.watch(["./index.js"], ["script"])
  gulp.watch(["./less/*.less"], ["less"])
})

gulp.task("build", ["less"]);
gulp.task("dev", ["connect", "less", "watch"], function() { dev = true });

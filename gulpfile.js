const gulp = require("gulp");
const babel = require("gulp-babel");
const postcss = require("gulp-postcss");
const replace = require("gulp-replace");
const htmlmin = require("gulp-htmlmin");
const terser = require("gulp-terser");
const sync = require("browser-sync");

// HTML

const html = () => {
  return gulp
    .src("src/*.html")
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("dist"))
    .pipe(sync.stream());
};

exports.html = html;

// Styles

const styles = () => {
  return gulp
    .src("src/assets/styles/index.css")
    .pipe(
      postcss([
        require("postcss-import"),
        require("postcss-media-minmax"),
        require("autoprefixer"),
        require("postcss-csso"),
      ])
    )
    .pipe(replace(/\.\.\//g, ""))
    .pipe(gulp.dest("dist"))
    .pipe(sync.stream());
};

exports.styles = styles;

// Scripts

const scripts = () => {
  return gulp
    .src("src/js/main.js")
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(terser())
    .pipe(gulp.dest("dist"))
    .pipe(sync.stream());
};

exports.scripts = scripts;

// Copy

const copy = () => {
  return gulp
    .src(
      ["src/assets/font/**/*", "src/assets/img/**/*", "src/assets/icons/**/*"],
      {
        base: "src",
      }
    )
    .pipe(gulp.dest("dist"))
    .pipe(
      sync.stream({
        once: true,
      })
    );
};

exports.copy = copy;

// Paths

const paths = () => {
  return gulp
    .src("dist/*.html")
    .pipe(
      replace(/(<link rel="stylesheet" href=")styles\/(index.css">)/, "$1$2")
    )
    .pipe(replace(/(<script src=")scripts\/(main.js">)/, "$1$2"))
    .pipe(gulp.dest("dist"));
};

exports.paths = paths;

// Server

const server = () => {
  sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: "dist",
    },
  });
};

exports.server = server;

// Watch

const watch = () => {
  gulp.watch("src/*.html", gulp.series(html, paths));
  gulp.watch("src/assets/styles/**/*.css", gulp.series(styles));
  gulp.watch("src/js/**/*.js", gulp.series(scripts));
  gulp.watch(
    ["src/assets/font/**/*", "src/assets/img/**/*", "src/assets/icons/**/*"],
    gulp.series(copy)
  );
};

exports.watch = watch;

// Default

exports.default = gulp.series(
  gulp.parallel(html, styles, scripts, copy),
  paths,
  gulp.parallel(watch, server)
);

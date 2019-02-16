import BrowserSync from "browser-sync";
import PluginError from "plugin-error";
import autoprefixer from "autoprefixer";
import flatten from "gulp-flatten";
import gulp from "gulp";
import hugoBin from "hugo-bin";
import log from "fancy-log";
import postcss from "gulp-postcss";
import sass from "gulp-sass";
import uglifycss from "gulp-uglifycss";
import webpack from "webpack";
import webpackConfig from "./webpack.conf";
import { spawn } from "child_process";

const browserSync = BrowserSync.create();

// Hugo arguments
const hugoArgsDefault = ["-d", "../dist", "-s", "site", "-v"];
const hugoArgsPreview = ["--buildDrafts", "--buildFuture"];

/**
 * Run hugo and build the site
 */
function buildSite(cb, options, environment = "development") {
  const args = options ? hugoArgsDefault.concat(options) : hugoArgsDefault;

  process.env.NODE_ENV = environment;

  return spawn(hugoBin, args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
      cb();
    } else {
      browserSync.notify("Hugo build failed :(");
      cb("Hugo build failed");
    }
  });
}

// Compile Javascript
gulp.task("js", (cb) => {
  var myConfig = Object.assign({}, webpackConfig);
  myConfig.mode = process.env.NODE_ENV;

  webpack(myConfig, (err, stats) => {
    if (err) throw new PluginError("webpack", err);
    log("[webpack]", stats.toString({
      colors: true,
      progress: true
    }));
    browserSync.reload();
    cb();
  });
});

// Move all fonts in a flattened directory
gulp.task("fonts", () => (
  gulp.src("./src/fonts/**/*")
    .pipe(flatten())
    .pipe(gulp.dest("./dist/fonts"))
    .pipe(browserSync.stream())
));

// Development tasks
gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, hugoArgsPreview));

gulp.task("scss", () => (
  gulp.src("./src/scss/*.scss")
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(uglifycss())
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream())
));

// Build/production tasks
gulp.task("build", gulp.series(["scss", "js", "fonts"],
  (cb) => buildSite(cb, [], "production")));
gulp.task("build-preview", gulp.series(["scss", "js", "fonts"],
  (cb) => buildSite(cb, hugoArgsPreview, "production")));

// Development server with browsersync
gulp.task("server", gulp.series(["hugo", "scss", "js", "fonts"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    port: process.env.PORT || 3000,
    host: process.env.IP || "127.0.0.1"
  });
  gulp.watch("./src/js/**/*.js", gulp.parallel(["js"]));
  gulp.watch("./src/scss/**/*.scss", gulp.parallel(["scss"]));
  gulp.watch("./src/fonts/**/*", gulp.parallel(["fonts"]));
  gulp.watch("./site/**/*", gulp.parallel(["hugo"]));
}));

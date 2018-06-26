import gulp from "gulp";
import {spawn} from "child_process";
import hugoBin from "hugo-bin";
import uglifycss from "gulp-uglifycss";
import gutil from "gulp-util";
import flatten from "gulp-flatten";
import postcss from "gulp-postcss";
import cssImport from "postcss-import";
import cssnext from "postcss-cssnext";
import BrowserSync from "browser-sync";
import webpack from "webpack";
import webpackConfig from "./webpack.conf";

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
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
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

// Compile CSS with PostCSS
gulp.task("css", () => (
  gulp.src("./src/css/*.css")
    .pipe(postcss([cssImport({from: "./src/css/main.css"}), cssnext()]))
    .pipe(uglifycss())
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream())
));

// Build/production tasks
gulp.task("build", gulp.series(["css", "js", "fonts"],
  (cb) => buildSite(cb, [], "production")));
gulp.task("build-preview", gulp.series(["css", "js", "fonts"],
  (cb) => buildSite(cb, hugoArgsPreview, "production")));

// Development server with browsersync
gulp.task("server", gulp.series(["hugo", "css", "js", "fonts"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    port: process.env.PORT || 3000,
    host: process.env.IP || "127.0.0.1"
  });
  gulp.watch("./src/js/**/*.js", gulp.parallel(["js"]));
  gulp.watch("./src/css/**/*.css", gulp.parallel(["css"]));
  gulp.watch("./src/fonts/**/*", gulp.parallel(["fonts"]));
  gulp.watch("./site/**/*", gulp.parallel(["hugo"]));
}));

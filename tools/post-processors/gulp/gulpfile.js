
// concts.......................

const {src, dest, watch, series, parallel} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const inject = require('gulp-inject');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const git = require('gulp-git');
const imagemin = require('gulp-imagemin');
const cssnext = require('postcss-preset-env');
const browserSync = require('browser-sync').create();
//const copy = require('gulp-copy');
//const jimp = require('gulp-jimp');
//const asciify = require('asciify-image');


// images
function imgTask(){
  return src('src/images/*')
    .pipe(
      imagemin([/*
        imagemin.optipng({
          optimizationLevel: 5, // 0~7 3Ⓓ
          bitDepthReduction: true, //trueⒹ
          colorTypeReduction: true,
          paletteReduction: true,
          interlaced: false,
          errorRecovery: true,
	      }),
        imagemin.gifsicle({interlaced: true}),
	      imagemin.mozjpeg({
	        quality: 75, //0~100
	        progressive: true,
	        //…
        }),*/
        imagemin.svgo({
		      plugins: [
		      	{name: 'removeViewBox', active: true},
		       	{name: 'cleanupIDs', active: false}
	       	]
	      })
      ], {verbose: true} // enable console.logs
    ))
    .pipe(dest('build/images/'));
}





// git tasks
/*
function gitTask(){
  return src('build/*')
    .pipe(git.add());
}
exports.add = gitTask;
*/


// html minify task
function htmlTask(){
  return src('src/*.html', {sourcemaps: false})
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeScriptTypeAttributes:true, //Remove type="text/javascript"
        removeStyleLinkTypeAttributes: true, //Remove type="text/css"
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true, //Remove attributes when value matches default.
        removeComments: true,
        removeEmptyElements: false, // true if not using empty cells of tables
        removeOptionalTags: false,
        sortAttributes: true,
        sortClassName: true,
        useShortDoctype: true
      })
    )
    .pipe(rename('index.html'))
    .pipe(dest('build'));
}





// sass→css task
function sassTask(){
  var plugins = [ 
    autoprefixer({overrideBrowserslist: ['last 1 version']}),
    cssnext(),
    cssnano()
  ];
  return src('src/*.scss', {sourcemaps: false})
 //.pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(dest('src/sass'))
    .pipe(postcss(plugins))
 //.pipe(sourcemaps.write('../maps'))
    .pipe(dest('build'));
}





// javascript task
function jsTask(){
  return src('src/**/*.js', {sourcemaps: false})
    .pipe(concat('script.js'))
    .pipe(
      terser({
        parse: {
          bare_returns: false,
          html5_comments: true,
          shebang: true, // support #!command as the first line
          spidermonkey: false
        },
        compress: {
          defaults: true, // affect MOST options initial values
          arrows: true, // m(){return x} → m:()=>x
          arguments: false,
          booleans: true, // !!a ? b : c → a ? b : c
          booleans_as_integers: false, // true|false → 1|0, ===|!== → ==|!=
          collapse_vars: true,
          comparisons: true, // !(a <= b) → a > b
          computed_props: true,//{["computed"]: 1}→{computed: 1}
          conditionals: true, // if|else
          dead_code: true,
          directives: true,
          drop_console: false,
          drop_debugger: true,
          ecma: 5 // 5|2015 'es5→ES6+'
          // …
        },
        mangle: {
          // mangle options
          properties: {
            // mangle property options
          }
        },
        format: {
          // format options (can also use `output` for backwards compatibility)
        },
        sourceMap: {
          // source map options
        },
        ecma: 5, // specify one of: 5, 2015, 2016, etc.
        enclose: false, // or specify true, or "args:values"
        keep_classnames: false,
        keep_fnames: false,
        ie8: false,
        module: false,
        nameCache: null, // or specify a name cache object
        safari10: false,
        toplevel: false
      })
    )
    //.pipe(rename('script.js'))
    .pipe(dest('build'));
}





// inject task
function injectTask() {
  var target = src('build/index.html');
  var sources = src(
    ['build/jquery*.js', 'build/style.css', 'build/script.js'], 
    {read: false}
  );
  return target
    .pipe(inject(sources, {
      relative: true,
      
    }))
    .pipe(rename('injected.html'))
    .pipe(dest('build'));
}





// deleting temp files
function deleteTask(cd){
  cd();
  console.log('~~Hi~phantombill~~processing: cleaned !!!');
  return del.sync(['build/**/*', '!build/index.html', '!build/images', '!build/jquery*.js']);
}






// browser sync
function serverTask(cd){
	browserSync.init({
        server: "build/"
    });
	cd();
	console.log('~~Hi~phantombill~~processing: connected !!!');
}
function reloadTask(cb){
  browserSync.reload();
  cb();
}







// watch task
function watchTask(){
  watch('src/**/*.scss', series(sassTask, reloadTask));
  watch('src/**/*.js', series(jsTask, reloadTask));
  watch('src/*.html', series(htmlTask, reloadTask));
  watch('src/images/*', series(imgTask, reloadTask));
  //watch('build/**/*', gitTask);
  console.log('~~Hi~phantombill~~processing: watching !!!');
}







// gulp tasks...............

exports.default = series(
  deleteTask,
  htmlTask,
  sassTask,
  jsTask,
  //gitTask,
  //injectTask,
  serverTask,
  watchTask
);
exports.html = htmlTask;
exports.js = jsTask;
exports.css = sassTask;
exports.inject = injectTask;
exports.del = deleteTask
exports.inject = injectTask;
exports.sync = serverTask;
exports.img = imgTask;
//exports.art = asciiTask;










/*
// img
function imgTask(){
  return src('src/images/gaara.png')
    .pipe(jimp({
        '-1': {
            crop: { x: 100, y: 100, width: 200, height: 200 },
            invert: true,
            flip: { horizontal: true, vertical: true },
            gaussian: 2,
            blur: 2,
            greyscale: true,
            sepia: true,
            opacity: 0.5,
        },
        '-2': {
            autocrop: { tolerance: 0.0002, cropOnlyFrames: false },
            resize: { width: 100, height: 100 },
            scale: 1.2,
            rotate: 90,
            brightness: 0.5,
            contrast: 0.3,
            type: 'bitmap'
        },
        '-3': {
            posterize: 2,
            dither565: true,
            background: '#ff0000',
            type: 'jpg'
        }
    }))
    .pipe(dest('build/images/'))
}
*/
/*
exports.default = function() {
  // The task will be executed upon startup
  watch(
    'src/*.js', 
    {
      events: 'all', //add|addDir|change|unlink|unlinkDir|ready|error
      ignoreInitial: false,
      queue: false, //sequence
      delay: 200, //ms
    }, 
    function(cb) {
      // body omitted
      cb();
    }
  );
};*/

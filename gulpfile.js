let project_folder = "dist";
let source_folder = "#src";

let parth = {
   build: {
      html: project_folder + "/",
      css: project_folder + '/',
      js: project_folder + '/',
      img: project_folder + '/',
      fonts: project_folder + '/fonts/'
   },
   src: {
      html: source_folder + "/index.html",
      scss: source_folder + '/**/index.scss',
      js: source_folder + '/**/index.js',
      img: source_folder + '/**/*.{jpg,png,svg,gif,ico,webp}',
      fonts: source_folder + '/fonts/*.ttf',
   },
   watch: {
      html: source_folder + "/**/*.html",
      scss: source_folder + '/**/*.scss',
      js: source_folder + '/**/*.js',
      img: source_folder + '/**/*.{jpg,png,svg,gif,ico,webp}',
      fonts: source_folder + '/fonts/*.ttf',
   },
   clean: "./" + project_folder + "/"
};

let {
   src,
   dest
} = require('gulp'),
   gulp = require('gulp'),
   browsersync = require('browser-sync').create(),
   fileinclude = require('gulp-file-include'),
   del = require('del'),
   scss = require('gulp-sass'),
   autoprefixer = require('gulp-autoprefixer'),
   group_media = require('gulp-group-css-media-queries'),
   clean_css = require('gulp-clean-css'),
   rename = require('gulp-rename'),
   uglify = require('gulp-uglify-es').default,
   imagemin = require('gulp-imagemin'),
   webp = require('gulp-webp'),
   webphtml = require('gulp-webp-html'),
   ttf2woff = require('gulp-ttf2woff'),
   ttf2woff2 = require('gulp-ttf2woff2');
   // svgSprite = require('gulp-svg-sprite');

function browserSync() {                        // запуск сервера
   browsersync.init({
      server: {
         baseDir: "./" + project_folder + "/"   // настройки сервера
      },
      port: 3000, 
      notify: false,                            // не выдавать сообщений
      online: false                             // не пускать сервер в локальную сеть
   })
}

function html() {                               // обработка html
   return src(parth.src.html)                   // берем отсюда
      .pipe(fileinclude())                      // если находим диррективу вкладываем внешние файлы
      .pipe(webphtml())                         // конвертируем строку c <img в <picture....webp 
      .pipe(dest(parth.build.html))             // ложим сюда
      .pipe(browsersync.stream())               // обновляем страницу
}

function js() {                                 // обработка html
   return src(parth.src.js)                     // берем отсюда
      .pipe(fileinclude())                      // если находим диррективу вкладываем внешние файлы
      .pipe(dest(parth.build.js))               // ложим сюда
      .pipe(                                    //переименовываем
         rename({
            extname: ".min.js"
         })
      )
      .pipe(uglify())                           // минифицируем
      .pipe(dest(parth.build.js))               // ложим сюда
      .pipe(browsersync.stream())               // обновляем
}

function images() {                             // обработка картинок
   return src(parth.src.img)                    // берем отсюда
      .pipe(                                    //переименовываем
         rename({
            dirname: "/img"
         })
      )
      .pipe(dest(parth.build.img))              // ложим сюда
      .pipe(
         webp({
            quality: 70                         // конвертируем в webp
         })
      )
      .pipe(dest(parth.build.img))              // ложим сюда
      // .pipe(src(parth.src.img))                 // берем отсюда
       
      // .pipe(                                    // сжимаем
      //    imagemin({
      //       progressive: true,
      //       svgoPlugins: [{ removeViewBox: false }],
      //       interplaced: true,
      //       optimizationLevel: 3
      //    })
      // )
      // .pipe(dest(parth.build.img))              // ложим сюда      
      .pipe(browsersync.stream())               // обновляем
}
function css() {                                // обработка css
   return src(parth.src.scss)                   // берем отсюда
      .pipe(
         scss({
            outputStyle: "expanded",            // конверт из scss в css
         })
      )  
      .pipe(   
         autoprefixer({                         // добавляем кроссбраузерность
            overrideBrowserslist: ["last 5 versions"],
            cascade: true
         })
      )      // .pipe(webpcss())                          // добавляем возможность работы с webp графикой
      .pipe(dest(parth.build.css))              // ложим сюда
      .pipe(clean_css())                        // минифицируем 
      .pipe(
         rename({
            extname: ".min.css"
         })
      )
      .pipe(dest(parth.build.css))              // ложим сюда
      .pipe(browsersync.stream())               // обновляем
}

function fonts() {                              // обработка фонтов
   src(parth.src.fonts)                         // берем отсюда
      .pipe(dest(parth.build.fonts))            // ложим копию
      .pipe(ttf2woff())                         // kонверт ttf в woff 
      .pipe(dest(parth.build.fonts))            // ложим 
   return src(parth.src.fonts)                  // берем
      .pipe(ttf2woff2())                        // kонверт ttf в woff2 
      .pipe(dest(parth.build.fonts))            // ложим сюда
      .pipe(browsersync.stream())               // обновляем
}

// gulp.task('svgSprite', function () {
//    return gulp.src([source_folder + '/iconsprite/*.svg'])   
//       .pipe(svgSprite({
//          mode: {
//             stack: {
//                sprite:"../icons/icons.svg"
//             }
//          }
//       }))
//       .pipe(dest(path.build.img))   
//    }
// )

function watchFiles() {                         // следим за изменениями в файлах
   gulp.watch([parth.watch.html], html);
   gulp.watch([parth.watch.scss], css);
   gulp.watch([parth.watch.js], js);
   gulp.watch([parth.watch.img], images);
   gulp.watch([parth.watch.fonts], fonts);
}

function clean() {                              // очищаем целевую папку перед обновлением сервера
   return del(parth.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
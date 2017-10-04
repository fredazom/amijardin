/*jslint*/
"use strict";
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var addsrc = require('gulp-add-src');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
require('es6-promise').polyfill();

var paths = {
    scripts: ['./public/javascripts/jquery-1.11.3.js', './public/javascripts/jquery.validate-1.14.0.js', './public/javascripts/utils.js', './public/javascripts/q.js', './public/javascripts/formFields.js', './public/javascripts/carrousel.js', './public/javascripts/amijardin.js'],
    scriptConcatenated: 'mapprod.js',
    build: './public/javascripts/build',
    forumScripts: ['./public/javascripts/jquery-1.11.3.js', './public/javascripts/jquery.validate-1.14.0.js', './public/javascripts/lodash_4_3_0.js', './public/javascripts/utils.js', './public/javascripts/editor/wysiwyg.js', './public/javascripts/editor/wysiwyg-editor.js', './public/javascripts/editor/custom_editor.js', './public/javascripts/questionFormFields.js', './public/javascripts/responseFormFields.js'],
    forumScriptConcatenated: 'forumprod.js',
    chiffresScripts: ['./public/javascripts/jquery-1.11.3.js', './public/javascripts/utils.js', './public/javascripts/chiffres/chiffres.js'],
    chiffresConcatenated: 'chiffresprod.js',
    singleForumScripts: ['./public/javascripts/forum/forum.js', './public/javascripts/forum/questionTemplate.js'],
    adminScripts: ['./public/javascripts/jquery-1.11.3.js', './public/javascripts/jquery.validate-1.14.0.js', './public/javascripts/jquery.validate_additional_methods-1.14.0.js', './public/javascripts/jquery-ui-1_11_4.js', './public/javascripts/lodash_4_3_0.js', './public/javascripts/utils.js', './public/javascripts/editor/wysiwyg.js', './public/javascripts/editor/wysiwyg-editor.js', './public/javascripts/editor/custom_editor.js', './public/javascripts/admin/nouvellesFormFields.js', './public/javascripts/admin/nouvelles.js', './public/javascripts/admin/gardens.js'],
    adminScriptsConcatenated: 'adminprod.js',
    nouvellesScripts: ['./public/javascripts/jquery-1.11.3.js', './public/javascripts/utils.js', './public/javascripts/lodash_4_3_0.js', './public/javascripts/nouvelles/nouvelles.js', './public/javascripts/calendar/calendar.js', './public/javascripts/calendar/calendar.js', './public/javascripts/jquery-ui-1_11_4.js', './public/javascripts/facebook.js'],
    nouvellesScriptsConcatenated: 'nouvellesprod.js',
    loginAdminScripts: ['./public/javascripts/jquery-1.11.3.js', './public/javascripts/jquery.validate-1.14.0.js', './public/javascripts/utils.js', './public/javascripts/login/loginFormFields.js', './public/javascripts/login/loginadmin.js'],
    loginAdminScriptsConcatenated: 'loginadminprod.js',
    cultivonsnousScripts: ['./public/javascripts/jquery-1.11.3.js', './public/javascripts/utils.js', './public/javascripts/cultivonsnous/menu.js', './public/javascripts/carrousel.js', './public/javascripts/cultivonsnous/main.js'],
    cultivonsnousScriptsConcatenated: 'cultivonsnousprod.js'
};
var pathsCss = {
    mapCss: ['./public/stylesheets/commun.css', './public/stylesheets/header.css', './public/stylesheets/carrousel.css', './public/stylesheets/map.css', './public/stylesheets/map-icons.css', './public/stylesheets/fontawesome.css'],
    mapCssConcatenated: 'mapprod.css',
    build: './public/stylesheets/build',
    communCss: ['./public/stylesheets/commun.css', './public/stylesheets/maintemplate.css', './public/stylesheets/header.css'],
    communCssConcatenated: 'communprod.css',
    forumCss: ['./public/stylesheets/commun.css', './public/stylesheets/maintemplate.css', './public/stylesheets/header.css', './public/stylesheets/fontawesome.css', './public/stylesheets/editor/wysiwyg-editor.css', './public/stylesheets/editor/custom_editor.css'],
    forumCssConcatenated: 'forumprod.css',
    chiffresCss: ['./public/stylesheets/commun.css', './public/stylesheets/maintemplate.css', './public/stylesheets/header.css', './public/stylesheets/map-icons.css'],
    chiffresCssConcatenated: 'chiffresprod.css',
    nouvellesCss: ['./public/stylesheets/build/forumprod.css', './public/stylesheets/nouvelles_commun.css', './public/stylesheets/calendar.css'],
    nouvellesCssConcatenated: "nouvellesprod.css",
    expertsCss: ['./public/stylesheets/build/communprod.css', './public/stylesheets/fontawesome.css', './public/stylesheets/experts.css'],
    expertsCssConcatenated: "expertsprod.css",
    cultivonsnousCss: ['./public/stylesheets/build/communprod.css', './public/stylesheets/carrousel.css', './public/stylesheets/cultivonsnous.css'],
    cultivonsnousCssConcatenated: "cultivonsnousprod.css"
};

gulp.task('clean', function() {
    return del([paths.build+"/*.*"]);
});
gulp.task('mapprod', [], function() {
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat(paths.scriptConcatenated))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.build));
});

gulp.task('forumscripts', [], function() {
    return gulp.src(paths.forumScripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat(paths.forumScriptConcatenated))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.build));
});

gulp.task('chiffresscripts', [], function() {
    return gulp.src(paths.chiffresScripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat(paths.chiffresConcatenated))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.build));
});

gulp.task('singleforumscripts', [], function() {
    return gulp.src(paths.singleForumScripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.build));
});

gulp.task('adminscripts', [], function() {
    return gulp.src(paths.adminScripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat(paths.adminScriptsConcatenated))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.build));
});

gulp.task('loginadminscripts', [], function() {
    return gulp.src(paths.loginAdminScripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat(paths.loginAdminScriptsConcatenated))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.build));
});

gulp.task('nouvellescripts', [], function() {
    return gulp.src(paths.nouvellesScripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat(paths.nouvellesScriptsConcatenated))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.build));
});

gulp.task('cultivonsnousscripts', [], function() {
    return gulp.src(paths.cultivonsnousScripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat(paths.cultivonsnousScriptsConcatenated))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.build));
});

//CSS
gulp.task('cleanCss', function() {
    return del([pathsCss.build+"/*.css"]);
});

gulp.task('communStyles', [], function(){
    return gulp.src(pathsCss.communCss)
        .pipe(concat(pathsCss.communCssConcatenated))
        .pipe(autoprefixer({ browsers: ['last 4 versions', 'ie > 7'] }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(pathsCss.build));
});

gulp.task('mapStyles', [], function() {
    return gulp.src(pathsCss.mapCss)
        .pipe(concat(pathsCss.mapCssConcatenated))
        .pipe(autoprefixer({ browsers: ['last 4 versions', 'ie > 7'] }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(pathsCss.build));
});

gulp.task('forumStyles', [], function(){
    return gulp.src(pathsCss.forumCss)
        .pipe(concat(pathsCss.forumCssConcatenated))
        .pipe(autoprefixer({ browsers: ['last 4 versions', 'ie > 7'] }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(pathsCss.build));
});
gulp.task('chiffresStyles', [], function(){
    return gulp.src(pathsCss.chiffresCss)
        .pipe(concat(pathsCss.chiffresCssConcatenated))
        .pipe(autoprefixer({ browsers: ['last 4 versions', 'ie > 7'] }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(pathsCss.build));
});
gulp.task('nouvellesStyles', [], function(){
    return gulp.src(pathsCss.nouvellesCss)
        .pipe(concat(pathsCss.nouvellesCssConcatenated))
        .pipe(autoprefixer({ browsers: ['last 4 versions', 'ie > 7'] }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(pathsCss.build));
});
gulp.task('expertsStyles', [], function(){
    return gulp.src(pathsCss.expertsCss)
        .pipe(concat(pathsCss.expertsCssConcatenated))
        .pipe(autoprefixer({ browsers: ['last 4 versions', 'ie > 7'] }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(pathsCss.build));
});
gulp.task('cultivonsnousStyles', [], function(){
    return gulp.src(pathsCss.cultivonsnousCss)
        .pipe(concat(pathsCss.cultivonsnousCssConcatenated))
        .pipe(autoprefixer({ browsers: ['last 4 versions', 'ie > 7'] }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(pathsCss.build));
});

gulp.task('style', ['mapStyles', 'communStyles', 'forumStyles', 'nouvellesStyles', 'expertsStyles', 'chiffresStyles', 'cultivonsnousStyles', 'cleanCss'], function() {
});

gulp.task('scripts', ['mapprod', 'forumscripts', 'singleforumscripts', 'adminscripts', 'nouvellescripts', 'loginadminscripts', 'chiffresscripts', 'cultivonsnousscripts', 'clean'], function() {
});
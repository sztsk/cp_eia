/**
 * Created by hugohua on 2014/5/15.
 */
/**
 * 自动化脚本定义
 */
module.exports = function (grunt) {
    'use strict';

    //load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


    //各自文件夹的任务,'watch:build'
    grunt.registerTask('default','全自动CSS、JS 压缩 合并 生成文件到build文件夹',['concat', 'uglify', 'css_combo','cssmin']);



    var pkg = grunt.file.readJSON('package.json');


    //写入文件头的信息
    var banner = '/*\n' +
        ' * Copyright <%= grunt.template.today("yyyy") %>, <%= pkg.author %>\n' +
        ' *\n' +
        ' * Released on: <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT")  %>  <%= pkg.author %>\n' +
        '*/\n';

    grunt.initConfig({
        pkg: pkg,
        //先清除上一次操作遗留的记录
        clean:{
            build:['build/']
        },
        //JS合并文件
        concat: {
            options: {
                //文件内容的分隔符
                separator: '\n',
                stripBanners: true,
                banner: banner
            },
            build: {
                src: ['js/pui.js','js/jquery.scrollnav.js','js/jquery.lazyload.js','js/jquery.slider.js','js/jquery.parallax.js','js/core.js','js/modal.js','js/common.js','js/index.js'],
                dest: 'js/all.full.js'  //eg: index/build/js/index.full.js
            }
        },
        //JS压缩
        uglify: {
            //文件头部输出信息
            options: {
                banner: banner,
                report: "min"//输出压缩率，可选的值有 false(不输出信息)，gzip
            },
            //具体任务配置
            build:{
                src: ['<%= concat.build.dest %>'],
                dest: 'js/all.min.js'  //eg: index/build/js/index.js
            }
        },
        //CSS压缩
        css_combo: {
            //文件头部输出信息
            options: {
                banner: banner
            },
            files: {
                src: ['css/style.css'],
                dest: 'css/style.all.css'  //eg: index/build/js/index.js
            }
        },

        cssmin: {
            //文件头部输出信息
            options: {
                banner: banner
            },
            files: {
                src: ['css/style.all.css'],
                dest: 'css/style.min.css'  //eg: index/build/js/index.js
            }
        }


        //将images文件夹copy到build目录下
//        copy: {
//            images: {
//                expand: true,
//                cwd: 'images/',           //通过cwd重设复制的相对路径 这样可以去掉目录结构
//                src: '**',
//                dest: 'build/images/',
//                filter: 'isFile'
//            },
//            imgs: {
//                expand: true,
//                cwd: 'imgs/',           //通过cwd重设复制的相对路径 这样可以去掉目录结构
//                src: '**',
//                dest: 'build/imgs/',
//                filter: 'isFile'
//            },
//            admin: {
//                expand: true,
//                cwd: 'admin/',           //通过cwd重设复制的相对路径 这样可以去掉目录结构
//                src: '**',
//                dest: 'build/admin/',
//                filter: 'isFile'
//            },
//            product:{
//                expand: true,
//                cwd: 'product/',           //通过cwd重设复制的相对路径 这样可以去掉目录结构
//                src: '**',
//                dest: 'build/product/',
//                filter: 'isFile'
//            }
//        }

    })
};
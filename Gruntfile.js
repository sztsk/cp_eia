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
    grunt.registerTask('default','全自动CSS、JS 压缩 合并 生成文件到build文件夹',['clean','concat:build', 'uglify', 'css_combo','copy']);



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
                src: ['js/*.js'],
                dest: 'build/js/all.full.js'  //eg: index/build/js/index.full.js
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
                dest: 'build/js/all.js'  //eg: index/build/js/index.js
            }
        },
        //CSS压缩
        css_combo: {
            //文件头部输出信息
            options: {
                banner: banner
            },
            files: {
                'build/css/style.css': ['css/style.css']
            }
        },
        //将images文件夹copy到build目录下
        copy: {
            images: {
                expand: true,
                cwd: 'images/',           //通过cwd重设复制的相对路径 这样可以去掉目录结构
                src: '**',
                dest: 'build/images/',
                filter: 'isFile'
            },
            imgs: {
                expand: true,
                cwd: 'imgs/',           //通过cwd重设复制的相对路径 这样可以去掉目录结构
                src: '**',
                dest: 'build/imgs/',
                filter: 'isFile'
            }
        }

    })
};
/**
 * Created by Zhang Haijun on 2016/10/20.
 */
module.exports = function (grunt) {
	//清除多余文件
	var clearList;
	grunt.clearFile = function(){
		var pkgData = grunt.file.readJSON('package.json');
		clearList = pkgData.config.lib.concat(pkgData.config.base,pkgData.config.css);
		for(var a in clearList){
			clearList[a] = '<%=pkg.targetPath%>' + clearList[a];
		}
	}
	grunt.clearFile();
	// 项目配置
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		//对模板进行压缩
		htmlmin: {
			html: {
				options: {
					removeComments: true, //删除注释
					collapseWhitespace: true //删除空白
				},
				files:[{
					'<%=pkg.targetPath%>WEB-INF/views/index.html':'WEB-INF/views/index.pub.html'
				},{
					expand: true,
					cwd: 'statics/tpl/',
					src: ['**/*.html'],
					dest: '<%=pkg.targetPath%>statics/tpl/'
				}]
			}
		},
		//对css进行压缩
		cssmin: {
			css: {
				files: [{
					'<%=pkg.targetPath%>statics/css/common.min.css':'<%= pkg.config.css %>'
				}, {
						expand: true,
						cwd: 'statics/css/',
						src: ['**/*.css', '!*.min.css'],
						dest: '<%=pkg.targetPath%>statics/css/'
					}
					]
			}
		},
		//对js规范化
		ngAnnotate: {
			options: {
				singleQuotes: true,//转换字符串为单引号
			},
			js: { //将所有angularjs格式化
				files: [{
					expand: true,
					cwd: 'statics/js/',
					src: ['**/*.js'],
					dest: 'statics/js/'
				}]
			}
		},
		//对JS进行压缩
		uglify: {
			options: {
				mangle: true//是否混淆
			},
			js: {
				files: [{
					//包文件
					'<%=pkg.targetPath%>statics/js/libs.min.js': '<%= pkg.config.lib %>',
					// 核心文件
					'<%=pkg.targetPath%>statics/js/base.min.js': '<%= pkg.config.base %>'
				}, {
					expand: true,
					cwd: 'statics/js/',
					src: ['**/*.js', '!*.min.js'],
					dest: '<%=pkg.targetPath%>statics/js/'
				}
				]
			},
		},
		//对图片进行压缩
		imagemin: {
			image: {
				options: { // Target options
					optimizationLevel: 3,
					svgoPlugins: [{
						removeViewBox: false
					}]
				},
				files: [{
					expand: true,
					cwd: 'statics/img/',
					src: ['**/*.{png,jpg,gif}'],
					dest: '<%=pkg.targetPath%>statics/img/'
				}]
			}
		},
		//对文件进行复制
		copy:{
			src:{
				files:[
					{
						expand: true,
						cwd: 'statics/libs',
						src: '**',
						dest: '<%=pkg.targetPath%>statics/libs/'
					}, {
						expand: true,
						cwd: 'statics/fonts/',
						src: '**',
						dest: '<%=pkg.targetPath%>statics/fonts/'
					}, {
						expand: true,
						cwd: 'statics/api/',
						src: '**',
						dest: '<%=pkg.targetPath%>statics/api/'
					}
				]
			}
		},
		//清空文件夹
		clean:{
			src: clearList,
			build: '<%=pkg.targetPath%>'
		}
	});
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-ng-annotate');
	// 默认任务
	grunt.registerTask('html', ['htmlmin']);
	grunt.registerTask('css', ['cssmin']);
	grunt.registerTask('js', ['uglify']);
	grunt.registerTask('image', ['imagemin']);
	grunt.registerTask('clear', ['clean:src']);
	grunt.registerTask('compress', ['htmlmin','cssmin','ngAnnotate','uglify','imagemin','copy']);
}
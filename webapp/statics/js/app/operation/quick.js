/**
 * Created by Zhang Haijun on 2016/11/29.
 */
(function () {
	"use strict";
	app.controller('DoScriptCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout',
		function($scope, httpLoad, $rootScope, $modal, $timeout) {
			$rootScope.link = '/statics/css/dotask.css';//引入页面样式
			$scope.itemsByPage = 5;$scope.scriptType = 'SHELL';
			//生成默认脚本名称
			(function(){
				//对时间进行格式化
				var format = function(value){
					if(value/1 < 10) value = '0' + value;
					return value;
				}
				var date = new Date();
				$scope.scriptName = '执行脚本-'+ date.getFullYear() + format(date.getMonth()+1) + format(date.getDate()) + format(date.getHours()) + format(date.getMinutes()) + format(date.getSeconds());
			})();
			(function(){
				//获取执行账户列表
				httpLoad.loadData({
					url:'/ident/list',
					noParam:true,
					data:{
						simple:true
					},
					success:function(data){
						if(data.success){
							$scope.accountData = data.data.rows;
							$scope.accountData.forEach(function (data) {
								data.name = data.username;
								if(data.remark){
									data.name = data.username + '(' + data.remark + ')';
								}
							});
						}
					}
				});
				//获取脚本列表数据
				httpLoad.loadData({
					url:'/script/list',
					data:{
						page:1,
						rows:10,
						simple:true
					},
					noParam:true,
					success:function(data){
						if(data.success){
							$scope.scriptListData = data.data.rows;
						}
					}
				})
			})();
			//选择服务器
			$scope.selectServer = function(){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/selectServerModal.html',
					controller: 'selectServerModalCtrl',
					backdrop: 'static',
					size:'lg',
					resolve: {
						selectList:function(){
							return angular.toJson($scope.serverListData || []);
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.serverListData = data;
					if(data.length > 0) $scope.isShowServer = true;
					$scope.totalSelect = $scope.serverListData.length;
				});
			};
			//删除选择的服务器
			$scope.delServer = function(key){
				$scope.serverListData.splice(key,1);
				$scope.totalSelect = $scope.serverListData.length;
			}
			//清除所有服务器
			$scope.clearServer = function(){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要清空所选择IP吗？';
						},
						btnList: function () {
							return  [{name:'清空',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.serverListData = [];
					$scope.totalSelect = $scope.serverListData.length;
				});
			}
			//选择脚本来源
			$scope.source = 1;
			$scope.selectSource = function () {
				$scope.source == 1 ? $scope.codeMirror.options.readOnly = false : $scope.codeMirror.options.readOnly = true;
			}
			//获取脚本内容
			$scope.scriptItem = {}
			$scope.getScriptValue = function(){
				httpLoad.loadData({
					url:'/script/detail',
					method:'GET',
					data:{
						id:$scope.scriptItem.selected.id
					},
					success:function(data){
						$scope.codeMirror.setValue(data.data.content);
					}
				});
			}
			//选择本地脚本
			$('.file').on('change',function(){
				var data = $(this)[0].files[0];
				//对文件大小和类型进行过滤
				var arr = data.name.split('.');
				if(['txt','sh','py','bat','pl'].indexOf(arr[arr.length-1]) == -1){
					$scope.$apply(function(){
						$scope.pop('请上传脚本类型的文件，【.txt，.sh，.py，.bat，.pl】','error');
					});
					return;
				}
				if(data.size > 1024*1024){
					$scope.$apply(function(){
						$scope.pop('文件大小超过1M','error');
					});
					return;
				}
				if (data) {
					//将文件进行转码，转换为text
					var reader = new FileReader();
					reader.readAsText(data);
					reader.onload = function (f) {
						$scope.codeMirror.setValue(this.result);
					}
				}
			});
			//执行脚本
			$scope.execute = function(){
				if($scope.$invalid) return;//表单验证不通过，直接return;
				var ipList = [];
				$scope.serverListData.forEach(function (data) {
					ipList.push({id:data.id,ip:data.ip})
				});
				var postData = {
					name: $scope.scriptName,
					identId: $scope.identId,
					timeout: $scope.timeout,
					params: $scope.params,
					targets:ipList,
					type:'SCRIPT',
					script: {
						type:$scope.scriptType,
						content:$scope.codeMirror.getValue()
					}
				}
				httpLoad.loadData({
					url:'/task/graph/execute',
					data: postData,
					success:function(data){
						if(data.success){
							$scope.currentJobId = data.data;
							$scope.seeResult();
							$scope.showSeeResult = true;
						}
					}
				});
			}
			//查看执行结果
			$scope.seeResult = function(){
				$timeout(function () {
					$scope.showDetail = true;
				},200);
				$scope.isActive = true;
			};
			$scope.goPage = function () {
				$scope.showDetail = false;
				$scope.isActive = false;
			}
		}
	]);
	app.controller('PublishFileCtrl', ['$scope', 'httpLoad', '$rootScope', '$modal', '$timeout', '$compile',
		function ($scope, httpLoad, $rootScope, $modal, $timeout,  $compile) {
			$rootScope.moduleTitle = '运维中心 > 快捷作业';//定义当前页
			$rootScope.link = '/statics/css/dotask.css';//引入页面样式
			$scope.itemsByPage = 5;
			$scope.path = '/tmp/demo/';
			//生成默认分发文件名称
			(function () {
				//对时间进行格式化
				var format = function (value) {
					if (value / 1 < 10) value = '0' + value;
					return value;
				}
				var date = new Date();
				$scope.taskName = '分发文件-' + date.getFullYear() + format(date.getMonth() + 1) + format(date.getDate()) + format(date.getHours()) + format(date.getMinutes()) + format(date.getSeconds());
			})();
			//获取执行账户列表
			httpLoad.loadData({
				url:'/ident/list',
				noParam:true,
				data:{
					simple:true
				},
				success: function (data) {
					if(data.success){
						$scope.accountData = data.data.rows;
						$scope.accountData.forEach(function (data) {
							data.name = data.username;
							if(data.remark){
								data.name = data.username + '(' + data.remark + ')';
							}
						});
					}
				}
			});
			$scope.serverFile = {};
			//选择服务器文件
			$scope.addServerFile = function () {
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/selectServerFileModal.html',
					controller: 'selectServerFileModalCtrl',
					//size:'lg',
					backdrop: 'static',
					resolve: {}
				});
				modalInstance.result.then(function (data) {
					$scope.serverFileListData = data;
				});
			};
			//删除服务器文件
			$scope.removeServerFile = function (flag,key) {
				if(flag == 1) $scope.uploaderList.splice(key,1);
				else $scope.serverFileListData.splice(key,1);
			}
			//选择服务器
			$scope.selectServer = function () {
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/selectServerModal.html',
					controller: 'selectServerModalCtrl',
					backdrop: 'static',
					size:'lg',
					resolve: {
						selectList:function(){
							return angular.toJson($scope.serverListData || []);
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.serverListData = data;
					if (data.length > 0) $scope.isShowServer = true;
					$scope.totalSelect = $scope.serverListData.length;
				});
			};
			//删除选择的服务器
			$scope.delServer = function (key) {
				$scope.serverListData.splice(key, 1);
				$scope.totalSelect = $scope.serverListData.length;
			}
			//清除所有服务器
			$scope.clearServer = function () {
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要清空所选择IP吗？';
						},
						btnList: function () {
							return  [{name:'清空',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.serverListData = [];
					$scope.totalSelect = $scope.serverListData.length;
				});
			}
			//复制IP
			$scope.copyIp = function () {
				$scope.ipGroup = '';
				for (var a in $scope.serverListData) {
					$scope.ipGroup += $scope.serverListData[a].IP + ',';
				}
				if ($scope.ipGroup) {
					new Clipboard('#ipGroup');
					$scope.pop('IP复制成功');
				} else $scope.pop('没有IP可以复制', 'error');
			}
			//执行脚本
			$scope.execute = function () {
				if($scope.$invalid) return;//表单验证不通过，直接return;
				var ipList = [],files = [];
				$scope.serverListData.forEach(function (data) {
					ipList.push({id:data.id,ip:data.ip})
				});
				$scope.uploaderList.forEach(function (data) {
					var obj = data.data;
					if(obj) files.push({fileId:obj.id,path:obj.path})
				});
				($scope.serverFileListData||[]).forEach(function (obj) {
					files.push({fileId:obj.id,path:obj.path})
				});
				var postData = {
					name: $scope.taskName,
					identId: $scope.identId,
					type:'FILE',
					timeout: $scope.timeout,
					targetPath:$scope.targetPath,
					targets:ipList,
					files:files
				}
				httpLoad.loadData({
					url: '/task/graph/execute',
					data:postData,
					success: function (data) {
						if(data.success){
							$scope.currentJobId = data.data;
							$scope.seeResult();
							$scope.showSeeResult = true;
						}
					}
				});
			};
			//查看执行结果
			$scope.seeResult = function(){
				$timeout(function () {
					$scope.showDetail = true;
				},200);
				$scope.isActive = true;
			};
			//返回
			$scope.goPage = function () {
				$scope.isActive = false;
				$timeout(function () {
					$scope.showDetail = false;
				}, 200);
			}
		}
	]);
})()
/**
 * Created by Zhang Haijun on 2016/11/29.
 */
(function () {
	"use strict";
	app.controller('DoScriptCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','CommonData',
		function($scope, httpLoad, $rootScope, $modal, $timeout, CommonData) {
			$rootScope.link = '/statics/css/dotask.css';//引入页面样式
			$scope.itemsByPage = 5;
			$scope.itemData = {
				type:'SCRIPT',
				identMode:'BATCH',
				failover:false,
				timeout:600,
				intervalTime:10,
				retryTime:3,
				script:{
					type:'SHELL'
				}
			};
			$scope.identModeData = CommonData.identMode;
			//生成默认脚本名称
			(function(){
				//对时间进行格式化
				var format = function(value){
					if(value/1 < 10) value = '0' + value;
					return value;
				}
				var date = new Date();
				$scope.itemData.name = '执行脚本-'+ date.getFullYear() + format(date.getMonth()+1) + format(date.getDate()) + format(date.getHours()) + format(date.getMinutes()) + format(date.getSeconds());
			})();
			$scope.selectMode = function () {
				$scope.itemData.identId = '';
				if($scope.identMode=='BATCH'){
					$scope.isExecuteAccount = false;
				}else{
					$scope.isExecuteAccount = true;
				}
			};
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
			//对值做验证
			$scope.validateValue = function(item,def){
				if($scope.itemData[item] < 1) $scope.itemData[item] = def;
			};
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
				if(!$scope.itemData.failover){
					$scope.itemData.retryTime = '';
					$scope.itemData.intervalTime = '';
				};
				$scope.itemData.script.content = $scope.codeMirror.getValue();
				$scope.itemData.targets = [];
				$scope.serverListData.forEach(function (data) {
					$scope.itemData.targets.push({ip:data.ip,status:data.status,username:data.username,password:data.password});
				});
				httpLoad.loadData({
					url:'/task/graph/execute',
					data: $scope.itemData,
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
	app.controller('PublishFileCtrl', ['$scope', 'httpLoad', '$rootScope', '$modal', '$timeout', '$compile','CommonData',
		function ($scope, httpLoad, $rootScope, $modal, $timeout,  $compile, CommonData) {
			$rootScope.moduleTitle = '日常作业 > 快捷作业';//定义当前页
			$scope.itemsByPage = 5;
			$scope.itemData = {
				type:'FILE',
				identMode:'BATCH',
				failover:false,
				timeout:600,
				intervalTime:10,
				retryTime:3,
				path:'/tmp/demo/'
			};
			$scope.identModeData = CommonData.identMode;
			//生成默认分发文件名称
			(function () {
				//对时间进行格式化
				var format = function (value) {
					if (value / 1 < 10) value = '0' + value;
					return value;
				}
				var date = new Date();
				$scope.itemData.name = '分发文件-' + date.getFullYear() + format(date.getMonth() + 1) + format(date.getDate()) + format(date.getHours()) + format(date.getMinutes()) + format(date.getSeconds());
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
			};
			$scope.selectMode = function () {
				$scope.identId = '';
				if($scope.identMode=='BATCH'){
					$scope.isExecuteAccount = false;
				}else{
					$scope.isExecuteAccount = true;
				}
				
			};
			//对值做验证
			$scope.validateValue = function(item,def){
				if($scope.itemData[item] < 1) $scope.itemData[item] = def;
			};
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
			//执行脚本
			$scope.execute = function () {
				if($scope.$invalid) return;//表单验证不通过，直接return;
				if(!$scope.itemData.failover){
					$scope.itemData.retryTime = '';
					$scope.itemData.intervalTime = '';
				};
				$scope.itemData.targets = [];
				$scope.serverListData.forEach(function (data) {
					$scope.itemData.targets.push({id:data.id,ip:data.ip,username:data.username,password:data.password})
				});
				$scope.itemData.files = [];
				$scope.uploaderList.forEach(function (data) {
					var obj = data.data;
					if(obj) $scope.itemData.files.push({fileId:obj.id,path:obj.path})
				});
				($scope.serverFileListData||[]).forEach(function (obj) {
					$scope.itemData.files.push({fileId:obj.id,path:obj.path})
				});
				httpLoad.loadData({
					url: '/task/graph/execute',
					data:$scope.itemData,
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
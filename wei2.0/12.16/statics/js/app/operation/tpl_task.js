/**
 * Created by Zhang Haijun on 2016/9/2.
 */
(function(){
	//选择服务器文件CTRL
	app.controller('selectServerFileModalCtrl', ['$scope', 'httpLoad', '$modalInstance',
		function($scope, httpLoad, $modalInstance) {
			$scope.itemsByPage = 5;//定义每页的条数
			//加载服务器列表
			httpLoad.loadData({
				url:'/software/listAll',
				noParam:true,
				success:function(data){
					$scope.serverListData= data.data;
					$scope.total = data.data.length;
					$scope.isDataLoad = true
				}
			});
			//全选
			$scope.selectAll = function(){
				for(var a in $scope.serverListData){
					$scope.serverListData[a].isSelected = $scope.isSelectAll;
				}
			}
			$scope.ok = function () {
				var data = [];
				for(var a in $scope.serverListData){
					var item = $scope.serverListData[a];
					if(item.isSelected){
						data.push(item);
					}
				}
				$modalInstance.close(data);
			}
			$scope.cancle = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	//新建文件task指令
	app.directive('ngFileTask', ['$compile',  function ($compile) {
		return {
			restrict: 'EA',
			scope:{},
			templateUrl:'/statics/tpl/operation/newtask/directive_tpl/taskfile.html',
			link: function (scope, element, attrs) {
				scope.itemData = {
					type: 'FILE'
				};
				//新增节点
				scope.addTaskNode = function(){
					$(element).find('.task-table').append($compile('<tbody class="job" ng-file-job="" ></tbody>')(scope))
				}
				var data = $(element).data('itemData');
				if(data){
					scope.itemData = data;
					for(var i in data.jobs){
						var data = data.jobs[i];
						scope.addTaskNode();
						var target = $(element).find('.job').last();
						target.data('itemData',data);
					}
				}else scope.addTaskNode();
				//获取编辑内容，组合数据
				$(".action-button>button").on('click',function () {
					$(element).data('itemData',scope.itemData);
				});
			}
		}
	}]);
	//新建脚本task指令
	app.directive('ngScriptTask', ['$compile', '$modal', '$rootScope', function ($compile, $modal, $rootScope) {
		return {
			restrict: 'EA',
			scope:{},
			templateUrl:'/statics/tpl/operation/newtask/directive_tpl/taskscript.html',
			link: function (scope, element, attrs) {
				scope.itemData = {
					type: 'SCRIPT'
				};
				//新增节点
				scope.addTaskNode = function(){
					$(element).find('.task-table').append($compile('<tbody class="job" ng-script-job="" ></tbody>')(scope))
				};
				var data = $(element).data('itemData');
				if(data){
					scope.itemData = data;
					for(var i in data.jobs){
						var datas = data.jobs[i];
						scope.addTaskNode();
						var target = $(element).find('.job').last();
						target.data('itemData',datas);
					}
				}else scope.addTaskNode();
				//获取编辑内容，组合数据
				$(".action-button>button").on('click',function () {
					$(element).data('itemData',scope.itemData);
				});
			}
		}
	}]);
	//新建文件job指令
	app.directive('ngFileJob', ['$modal', '$compile', 'httpLoad', function ($modal, $compile, httpLoad) {
		return {
			restrict: 'EA',
			scope:{},
			templateUrl:'/statics/tpl/operation/newtask/directive_tpl/jobfile.html',
			link: function (scope, element, attrs) {
				if($('.step-content').hasClass('tpl')) scope.hideTarget = true;
				scope.itemData = {
					suspendable: false,
				};
				scope.files = [];
				//获取执行账户列表
				(function(){
					httpLoad.loadData({
						url:'/ident/list',
						noParam:true,
						data:{
							simple:true
						},
						success:function(data){
							if(data.success){
								scope.accountData = data.data.rows;
								for(var a in scope.accountData){
									var data = scope.accountData[a];
									data.name = data.username;
									if(data.remark){
										data.name = data.username + '(' + data.remark + ')';
									}
								}
							}
						}
					});
				})();
				 //添加服务器文件
				scope.addServerFile = function () {
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/selectServerFileModal.html',
						controller: 'selectServerFileModalCtrl',
						//size:'lg',
						backdrop: 'static',
						resolve: {}
					});
					modalInstance.result.then(function (data) {
						scope.serverFileListData = data;
					});
				}
				//删除服务器文件
				scope.removeServerFile = function (flag,key) {
					if(flag == 1) scope.uploaderList.splice(key,1);
					else scope.serverFileListData.splice(key,1);
				}
				// scope.addServerFile = function(){
				// 	$(element).find('.file-table').append($compile('<tbody class="server-file-node" ng-file-job-add-file="" account-data="accountData" ></tbody>')(scope));
				// }
				var data = $(element).data('itemData');
				if(data){
					scope.serverListData = data.targets;
					scope.totalSelect = scope.serverListData.length;
					scope.serverFileListData = data.files
					scope.itemData = data;
				}
				//选择目标服务器
				scope.selectServer = function(){
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/selectServerModal.html',
						controller: 'selectServerModalCtrl',
						backdrop: 'static',
						size:'lg',
						resolve: {
							selectList:function(){
								return angular.toJson(scope.serverListData || []);
							}
						}
					});
					modalInstance.result.then(function (data) {
						scope.serverListData = data;
						if(data.length > 0) scope.isShowServer = true;
						scope.totalSelect = scope.serverListData.length;
					});
				};
				//删除选择的服务器
				scope.delServer = function(key){
					scope.serverListData.splice(key,1);
					scope.totalSelect = scope.serverListData.length;
				};
				//清除所有服务器
				scope.clearServer = function(){
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
						scope.serverListData = [];
						scope.totalSelect = scope.serverListData.length;
					});
				}
				//获取编辑内容，组合数据
				$(".action-button>button").on('click',function () {
					scope.itemData.targets = [];
					for(var i in scope.serverListData){
						var data = scope.serverListData[i]
						scope.itemData.targets.push({ip:data.ip,status:data.status});
					};
					scope.itemData.files = [];
					for(var a in scope.uploaderList){
						var obj = scope.uploaderList[a].data;
						if(obj) scope.itemData.files.push({fileId:obj.id,path:obj.path})
					}
					for(var a in scope.serverFileListData){
						var obj = scope.serverFileListData[a];
						scope.itemData.files.push({fileId:obj.fileId || obj.id,path:obj.path})
					}
					$(element).data('itemData',scope.itemData);
				});
			}
		}
	}]);
	//新建文件job->添加服务器文件指令
	app.directive('ngFileJobAddFile', ['$modal', 'httpLoad', function ($modal, httpLoad) {
		return {
			restrict: 'EA',
			scope:{
				accountData: '='
			},
			templateUrl:'/statics/tpl/operation/newtask/directive_tpl/addserverfile.html',
			link: function (scope, element, attrs) {
				scope.addServerStatus = 1;
				scope.itemData = {};
				//获取文件列表
				var getFileList = function(){
					httpLoad.loadData({
						url:'/software/list',
						data:{
							page:1,
							rows:10,
							simple:true
						},
						success:function(data){
							scope.fileList = data.data.rows;
						}
					});
				};
				getFileList();
				var data = $(element).data('itemData');
				if(data){
					scope.itemData = data;
					// getFileList(data.id);
					scope.itemData = data;
					scope.addServerStatus = 2;
				}
				//改变编辑状态
				scope.changeStatus = function(status){
					scope.addServerStatus = status;
					if(status == 2){
						$(element).data('itemData',scope.itemData);
					}
				};
				//选择单个服务器
				scope.selectSingleServer = function(){
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/selectSingleServerModal.html',
						controller: 'selectSingleServerModalCtrl',
						backdrop: 'static',
						resolve: {}
					});
					modalInstance.result.then(function (data) {
						if(data) scope.serverInfo = data;
						getFileList(data.id)
					});
				};
			}
		}
	}]);
	//新建脚本job指令
	app.directive('ngScriptJob', ['$rootScope','$compile', '$modal', 'httpLoad', '$timeout',  function ($rootScope, $compile, $modal, httpLoad, $timeout) {
		return {
			restrict: 'EA',
			scope:{},
			templateUrl:'/statics/tpl/operation/newtask/directive_tpl/jobscript.html',
			link: function (scope, element, attrs) {
				if($('.step-content').hasClass('tpl')) scope.hideTarget = true;
				scope.itemData = {
					suspendable: false,
					script:{
						type:'SHELL'
					}
				};
				//获取脚本内容
				scope.scriptItem = {};
				scope.getScriptValue = function(id){
					httpLoad.loadData({
						url:'/script/detail',
						method:'GET',
						data:{
							id:scope.scriptItem.selected.id
						},
						success:function(data){
							scope.codeMirror.setValue(data.data.content);
						}
					});
				};
				var data = $(element).data('itemData');
				if(data){
					scope.serverListData = data.targets;
					scope.totalSelect = scope.serverListData.length;
					$timeout(function(){
						$(element).find('.content').css('display','block');//解决脚本编辑器回显问题
						scope.codeMirror.setValue(data.script.content);
						$(element).find('.content').css('display','none');
					},10);
					scope.itemData = data;
				}
				scope.source = 1;
				//获取执行账户列表
				(function(){
					httpLoad.loadData({
						url:'/ident/list',
						noParam:true,
						data:{
							simple:true
						},
						success:function(data){
							if(data.success){
								scope.accountData = data.data.rows;
								for(var a in scope.accountData){
									var data = scope.accountData[a];
									data.name = data.username;
									if(data.remark){
										data.name = data.username + '(' + data.remark + ')';
									}
								}
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
							scope.scriptListData = data.data.rows;
						}
					})
				})();
				//选择脚本来源
				scope.selectSource = function () {
					scope.source == 1 ? scope.codeMirror.options.readOnly = false : scope.codeMirror.options.readOnly = true;
				}
				//获取脚本内容
				scope.scriptItem = {}
				scope.getScriptValue = function(){
					httpLoad.loadData({
						url:'/script/detail',
						method:'GET',
						data:{
							id:scope.scriptItem.selected.id
						},
						success:function(data){
							scope.codeMirror.setValue(data.data.content);
						}
					});
				}
				//选择本地脚本
				$(element).find('.file').on('change',function(){
					var data = $(this)[0].files[0];
					//对文件大小和类型进行过滤
					var arr = data.name.split('.');
					if(['txt','sh','py','bat','pl'].indexOf(arr[arr.length-1]) == -1){
						scope.$apply(function(){
							$rootScope.pop('请上传脚本类型的文件，【.txt，.sh，.py，.bat，.pl】','error');
						});
						return;
					}
					if(data.size > 1024*1024){
						scope.$apply(function(){
							$rootScope.pop('文件大小超过1M','error');
						});
						return;
					}
					if (data) {
						//将文件进行转码，转换为text
						var reader = new FileReader();
						reader.readAsText(data);
						reader.onload = function (f) {
							scope.codeMirror.setValue(this.result);
						}
					}
				});
				//选择目标服务器
				scope.selectServer = function(){
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/selectServerModal.html',
						controller: 'selectServerModalCtrl',
						backdrop: 'static',
						size:'lg',
						resolve: {
							selectList:function(){
								return angular.toJson(scope.serverListData || []);
							}
						}
					});
					modalInstance.result.then(function (data) {
						scope.serverListData = data;
						if(data.length > 0) scope.isShowServer = true;
						scope.totalSelect = scope.serverListData.length;
					});
				};
				//删除选择的服务器
				scope.delServer = function(key){
					scope.serverListData.splice(key,1);
					scope.totalSelect = scope.serverListData.length;
				};
				//控制是否显示编辑内容
				scope.showEditContent = function () {
					scope.isShowContent = !scope.isShowContent;
				};
				//清除所有服务器
				scope.clearServer = function(){
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
						scope.serverListData = [];
						scope.totalSelect = scope.serverListData.length;
					});
				}
				//获取编辑内容，组合数据
				$(".action-button>button").on('click',function () {
					scope.itemData.script.content = scope.codeMirror.getValue();
					scope.itemData.targets = [];
					for(var i in scope.serverListData){
						var data = scope.serverListData[i];
						scope.itemData.targets.push({ip:data.ip,status:data.status});
					};
					$(element).data('itemData',scope.itemData);
				})
			}
		}
	}]);
	//新建备份文件task指令
	app.directive('ngBackupTask', ['$compile',function ($compile) {
		return {
			restrict: 'EA',
			scope:{},
			templateUrl:'/statics/tpl/operation/newtask/directive_tpl/taskbackupfile.html',
			link: function (scope, element, attrs) {
				scope.itemData = {
					type: 'BACKUP'
				};
				//新增节点
				scope.addTaskNode = function(){
					$(element).find('.task-table').append($compile('<tbody class="job" ng-backup-job="" ></tbody>')(scope))
				};
				var data = $(element).data('itemData');
				if(data){
					scope.itemData = data;
					for(var i in data.jobs){
						var datas = data.jobs[i];
						scope.addTaskNode();
						var target = $(element).find('.job').last();
						target.data('itemData',datas);
					}
				}else scope.addTaskNode();
				//获取编辑内容，组合数据
				$(".action-button>button").on('click',function () {
					$(element).data('itemData',scope.itemData);
				});
			}
		}
	}]);
	//新建备份文件job指令
	app.directive('ngBackupJob', ['$modal', '$compile', 'httpLoad', function ($modal, $compile, httpLoad) {
		return {
			restrict: 'EA',
			scope:{},
			templateUrl:'/statics/tpl/operation/newtask/directive_tpl/jobbackupfile.html',
			link: function (scope, element, attrs) {
				if($('.step-content').hasClass('tpl')) scope.hideTarget = true;
				scope.itemData = {
				};
				//获取执行账户列表
				(function(){
					httpLoad.loadData({
						url:'/ident/list',
						noParam:true,
						data:{
							simple:true
						},
						success:function(data){
							if(data.success){
								scope.accountData = data.data.rows;
								for(var a in scope.accountData){
									var data = scope.accountData[a];
									data.name = data.username;
									if(data.remark){
										data.name = data.username + '(' + data.remark + ')';
									}
								}
							}
						}
					});
				})();
				var data = $(element).data('itemData');
				if(data){
					scope.serverListData = data.targets;
					scope.totalSelect = scope.serverListData.length;
					scope.itemData = data;
				}
				//选择目标服务器
				scope.selectServer = function(){
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/selectServerModal.html',
						controller: 'selectServerModalCtrl',
						backdrop: 'static',
						size:'lg',
						resolve: {
							selectList:function(){
								return angular.toJson(scope.serverListData || []);
							}
						}
					});
					modalInstance.result.then(function (data) {
						scope.serverListData = data;
						if(data.length > 0) scope.isShowServer = true;
						scope.totalSelect = scope.serverListData.length;
					});
				};
				//删除选择的服务器
				scope.delServer = function(key){
					scope.serverListData.splice(key,1);
					scope.totalSelect = scope.serverListData.length;
				};
				//清除所有服务器
				scope.clearServer = function(){
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
						scope.serverListData = [];
						scope.totalSelect = scope.serverListData.length;
					});
				}
				//获取编辑内容，组合数据
				$(".action-button>button").on('click',function () {
						scope.itemData.targets = [];
						for(var i in scope.serverListData){
							var data = scope.serverListData[i]
							scope.itemData.targets.push({ip:data.ip,status:data.status});
						};
					$(element).data('itemData',scope.itemData);
				});
			}
		}
	}]);
	//任务页面跳转
	app.directive('ngTaskMainRouter', ['$rootScope', 'httpLoad', function ($rootScope, httpLoad) {
		return {
			restrict: 'EA',
			scope:false,
			link: function (scope, element, attrs) {
				$rootScope.link = '/statics/css/task.css';
				//控制页面跳转
				scope.routerStatus = 1;
				scope.goTaskDetail = function(id){
					httpLoad.loadData({
						url:'/record/task',
						method:'GET',
						data:{id:id},
						success:function(data){
							if(data.success){
								scope.goPage(3);
								scope.currentRecordId = id;
								scope.detailData = data.data;
							}
						}
					});
				};
				scope.execute = function(){
					httpLoad.loadData({
						url:'/task/start',
						method:'POST',
						data:{id:scope.detailData.id},
						success:function(data){
							if(data.success){
								scope.goPage(3);
								scope.currentRecordId = data.data;
							}
						}
					});
				};
				scope.goPage = function(flag){
					scope.routerStatus = flag;
				};
				scope.goPreviewTask = function(id){
					httpLoad.loadData({
						url:'/task/detail',
						method:'GET',
						data:{id:id},
						success:function(data){
							if(data.success){
								scope.goPage(2);
								scope.detailData = data.data;
							}
						}
					});
				};
				scope.goJobDetail = function(id){//跳转到执行详情
					scope.goPage(4);
					scope.currentJobId = id;
				}
			}
		}
	}]);
	//websocket文件上传指令
	app.directive('ngFileUpload', ['$rootScope', '$modal', 'httpLoad', function ($rootScope, $modal, httpLoad) {
		return {
			restrict: 'EA',
			scope: false,
			link: function (scope, element, attrs) {
				scope.uploaderList = [];
				$('#btnFileUpload').on('change', function (event) {
					var files = event.target.files, list = [];
					for (var i = 0; i < files.length; i++) {
						if(/[\u4e00-\u9fa5]/.test(files[i].name)){
							$rootScope.pop('文件名不允许存在中文','error');
							continue;
						}
						var obj = {file: files[i]};
						list.push(obj);
					}
					scope.$apply(function () {
						scope.uploaderList = scope.uploaderList.concat(list);
					});
				});
				scope.upload = function (item) {
					var socket = new WebSocket('ws://' + location.host +'/uploadService');
					var i = 0;var startSize = 0,endSize = 0;
					var paragraph = 4 * 1024 * 1024;    //以4MB为一个分片
					var count = parseInt(item.file.size / paragraph) + 1;
					socket.onopen = function () {
						item.isUploading = true;
						socket.send(JSON.stringify({
								'filename': item.file.name,
								'upload': 'file'
							}));
						//取消上传
						item.cancel = function () {
							item.progress = 0;
							socket.send(JSON.stringify({
								'UPLOAD_CANCEL': 'UPLOAD_CANCEL'
							}));
							item.isUploading = false;
						};
					};
					socket.onmessage = function (event) {
						var sendFile = function(){
							if(startSize < item.file.size) {
								var blob;
								startSize = endSize;
								endSize += paragraph;
								
								if (item.file.webkitSlice) {
									blob = item.file.webkitSlice(startSize, endSize);
								} else if (item.file.mozSlice) {
									blob = item.file.mozSlice(startSize, endSize);
								} else {
									blob = item.file.slice(startSize, endSize);
								}
								var reader = new FileReader();
								reader.readAsArrayBuffer(blob);
								
								reader.onload = function loaded(evt) {
									var result = evt.target.result;
									i++;
									var isok = (i / count) * 100;
									item.progress = parseInt(isok);
									socket.send(result);
								};
							}else{
								item.progress = 100;
								socket.send(JSON.stringify({
									'sendover': 'sendover'
								}));
							}
							}
						item.isUploading = true;
						item.isCancel = false;
						var obj = JSON.parse(event.data);
						if (obj.category == "UPLOAD_ACK") {
							item.filePath = obj.content;
							sendFile();
						} else if (obj.category == 'UPLOAD') {
							if (obj.content == 'SAVE_FAILURE') {
								item.isUploading = false;
								scope.pop('文件上传失败','error');
							} else if (obj.content == 'SAVE_SUCCESS') {
								sendFile();
							} else if (obj.content == 'TRUE') {
								httpLoad.loadData({
									url: '/software/create',
									data:{
										name:item.file.name,
										path:item.filePath
									},
									success: function (data) {
										if(data.success){
											item.data = data.data;
										}
									}
								});
								item.isReady = true; item.isSuccess = true;item.isUploading = false;
								socket.close();
							}
						} else if (obj.category == 'UPLOAD_CANCEL') {
							scope.pop('已取消文件上传','info');
							item.progress = 0;
							item.isCancel = true;
							socket.close();
						}
						scope.$apply(scope.progress);
					};
				};
			}
		}
	}]);
//任务预览
	app.directive('ngExcuteDetail', [function () {
		return {
			restrict: 'EA',
			templateUrl:'/statics/tpl/operation/template/executeDetail.html',
			scope:true,
			link: function (scope, element, attrs) {
				$(element).on("click",".btn-showdetail-job",function(){
					var tip = $(this).attr("tip");
					var target = $(this).parents('tbody').find('.content');
					if(tip == 1) {
						$(this).attr("tip","2");
						target.hide();
					}else {
						$(this).attr("tip","1");
						target.show();
					}
				});
			}
		}
	}]);
//任务执行结果
	app.directive('ngExcuteResultDetail', ['httpLoad', 'webSocket', '$modal', function (httpLoad, webSocket, $modal) {
		return {
			restrict: 'EA',
			templateUrl:'/statics/tpl/operation/template/executeResultDetail.html',
			scope:true,
			link: function (scope, element, attrs) {
				scope.continue = function(id){
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/delModal.html',
						controller: 'delModalCtrl',
						backdrop: 'static',
						resolve:{
							tip: function () {
								return '你确定要继续该任务吗？';
							},
							btnList: function(){
								return [{name:'继续',type:'btn-primary'},{name:'取消',type:'btn-default'}];
							}
						}
					});
					modalInstance.result.then(function() {
						httpLoad.loadData({
							url:'/task/active',
							method:'POST',
							data:{
								uuid: scope.taskDetailData.uuid,
								jrId: id
							},
							success:function(data){
								if(data.success){
									scope.pop('任务继续');
								}
							}
						});
					});
				};
				scope.cancel = function(){
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/delModal.html',
						controller: 'delModalCtrl',
						backdrop: 'static',
						resolve:{
							tip: function () {
								return '你确定要取消该任务吗？';
							},
							btnList: function(){
								return [{name:'确认',type:'btn-danger'},{name:'关闭',type:'btn-default'}];
							}
						}
					});
					modalInstance.result.then(function() {
						httpLoad.loadData({
							url:'/task/cancel',
							method:'POST',
							data:{
								uuid: scope.taskDetailData.uuid
							},
							success:function(data){
								if(data.success){
									scope.pop('任务取消');
								}
							}
						});
					});
				};
				var startWebSocket = function () {
					webSocket.loadData({
						message:function(data){
							if(data.taskId == scope.currentRecordId){
								scope.progress = data.progress;
								getTaskDetail();
							}
						}
					});
				};
				var getTaskDetail = function(){
					httpLoad.loadData({
						url:'/record/task',
						method:'GET',
						data:{id:scope.currentRecordId},
						success:function(data){
							if(data.success){
								scope.taskDetailData = data.data;
								if(scope.taskDetailData.status == 'SUCCESS' ||  scope.taskDetailData.status == 'FAIL'){
									scope.progress = 100;
								} else{
									startWebSocket();
								}
							}
						}
					});
				};
				//从缓存中拿去数据
				scope.progress = sessionStorage.getItem('T'+scope.currentRecordId);
				getTaskDetail();
			}
		}
	}]);
//执行job详情
	app.directive('ngExecuteJobDetail', ['httpLoad', 'webSocket', '$interval', function (httpLoad, webSocket, $interval) {
		return {
			restrict: 'EA',
			templateUrl:'/statics/tpl/operation/template/executeJobDetail.html',
			scope:true,
			link: function (scope, element, attrs) {
				scope.progress = sessionStorage.getItem('J'+scope.currentJobId);
				scope.param = {
					page:1,
					rows:5
				}
				//获取log详情
				scope.loadDetailLog = function(key,result){
					for(var a in scope.executeList){
						scope.executeList[a].isSelect = false;
					}
					scope.executeList[key].isSelect = true;
					scope.logDetail = JSON.parse(result);
				}
				scope.getExecuteList = function(page,status){
					scope.param.page = page || scope.param.page;
					scope.params[0].param.status = status || scope.params[0].param.status;
					scope.param.params = JSON.stringify(scope.params);
					httpLoad.loadData({
						url:'/record/results',
						data:scope.param,
						noParam:true,
						success:function(data){
							if(data.success){
								scope.executeList = data.data.rows;
								scope.totalLog = data.data.total;
								scope.loadDetailLog(0,scope.executeList[0].result);
							}
						}
					})
				};
				var interval;
				var startWebSocket = function () {
					webSocket.loadData({
						message:function(data){
							if(data.jobId == scope.currentJobId){
								scope.$apply(function(){
										scope.progress = data.progress;
									});
								if(data.progress == 100){
									interval = $interval(function(){
										getJobDetail();
									},100)
								};
							}
						}
					});
				};
				
				var getJobDetail = function() {
					httpLoad.loadData({
						url:'/record/job',
						data:{
							id: scope.currentJobId
						},
						method:'GET',
						success:function(data){
							if(data.success){
								scope.detailData = data.data;
								scope.params = [{param:{jrId:scope.detailData.id},sign:'EQ'}];
								if(scope.detailData.status == 'SUCCESS' ||  scope.detailData.status == 'FAIL'){
									scope.progress = 100;
									if(interval) $interval.cancel(interval);
								} else{
									startWebSocket();
								}
							}
						}
					});
				};
				getJobDetail();
			}
		}
	}]);
//在线编辑指令
	app.directive('ngCodeMirror', [function () {
		return {
			restrict: 'EA',
			scope:{
				codeMirror: '='
			},
			link: function (scope, element, attrs) {
				var editor = $(element).find('.textarea')[0];
				scope.codeMirror = CodeMirror.fromTextArea(editor, {
						theme: 'erlang-dark',
						mode: 'shell',
						lineNumbers: true,
						readOnly: false,
					  extraKeys: {
						"F11": function(cm) {
							cm.setOption("fullScreen", !cm.getOption("fullScreen"));
						},
						"Esc": function(cm) {
							if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
						}
					}
					});
				//全屏展示
				$(element).find('.icon-size-fullscreen').on('click',function(){
					var escTip =  $('<div style="z-index:10000;font-size:16px;color:#f05050;position: fixed;top: 10px;left:50%;text-align: center;opacity: 1;font-weigth:bold;background-color: #e7fff8;padding:5px;width:400px;margin-left:-200px;">您现在处于全屏模式，按ESC键可以退出全屏！</div>');
					$(document.body).append(escTip);
					escTip.animate({
						opacity : '0'
					},5000,function(){
						escTip.remove();
					});
					scope.codeMirror.setOption("fullScreen", true);
				});
				if(attrs.ngCodeMirror) $(element).parents('.content').css('display','none');
				$(element).find('.code-type').data('codeMirror',scope.codeMirror);
			}
		}
	}]);
//在线编辑指令->只适用于显示只读
	app.directive('ngCodeMirror2', ['$timeout',function ($timeout) {
		return {
			restrict: 'EA',
			scope:{
				data:'=',
			},
			link: function (scope, element, attrs) {
				var editor = $(element).find('.textarea')[0],codeMirror
				codeMirror = CodeMirror.fromTextArea(editor, {
					theme: 'erlang-dark',
					mode: 'shell',
					lineNumbers: true,
					readOnly: true,
					extraKeys: {
						"F11": function(cm) {
							cm.setOption("fullScreen", !cm.getOption("fullScreen"));
						},
						"Esc": function(cm) {
							if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
						}
					}
				});
				//全屏展示
				$(element).find('.icon-size-fullscreen').on('click',function(){
					var escTip =  $('<div style="z-index:10000;font-size:16px;color:#f05050;position: fixed;top: 10px;left:50%;text-align: center;opacity: 1;font-weigth:bold;background-color: #e7fff8;padding:5px;wentth:400px;margin-left:-200px;">您现在处于全屏模式，按ESC键可以退出全屏！</div>');
					$(document.body).append(escTip);
					escTip.animate({
						opacity : '0'
					},5000,function(){
						escTip.remove();
					});
					codeMirror.setOption("fullScreen", true);
				});
				codeMirror.setValue(scope.data);
				$(element).parents('.content').css('display','none');
			}
		}
	}]);
	//对指令元素操作指令
	app.directive('ngHandleDom', ['$rootScope', '$modal', '$timeout', function ($rootScope, $modal, $timeout) {
		return {
			restrict: 'EA',
			scope:{},
			link: function (scope, element, attrs) {
				//步骤之间可以调整顺序
				$(element).sortable({
					handle: 'div[ng-drag-modal]',
					delay: 100
				});
				//删除步骤
				$(element).on('click', '.btn-remove-step', function($event){
					$event.stopPropagation();
					var that = this;
					if($(element).find('.step').length < 2 ) {
						$timeout(function(){
							$rootScope.pop('作业中最少需要一个步骤','error');
						});
						return;
					}
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/delModal.html',
						controller: 'delModalCtrl',
						backdrop: 'static',
						resolve:{
							tip: function () {
								return '你确定要删除该步骤吗？';
							},
							btnList: function () {
								return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
							}
						}
					});
					modalInstance.result.then(function() {
						$('.drag-step-list').find('.drag-step-cell').eq($('.step').index()).remove();
						$(that).parents('.step').remove();
					});
				});
				//删除节点
				$(element).on('click', '.btn-remove-job', function($event){
					$event.stopPropagation();
					var that = this;
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/delModal.html',
						controller: 'delModalCtrl',
						backdrop: 'static',
						resolve:{
							tip: function () {
								return '你确定要删除该节点吗？';
							},
							btnList: function () {
								return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
							}
						}
					});
					modalInstance.result.then(function() {
						$(that).parents('.job').remove();
					});
				});
				//删除文件列表节点
				$(element).on('click', '.btn-remove-file-node', function($event){
					$event.stopPropagation();
					var target = $(this).parents('.server-file-node');
					target.remove();
				});
				//上移节点
				$(element).on('click', '.btn-move-job-up', function($event){
					$event.stopPropagation();
					var target = $(this).parents('.job');
					target.prev().before(target)
				});
				//下移节点
				$(element).on('click', '.btn-move-job-down', function($event){
					$event.stopPropagation();
					var target = $(this).parents('.job');
					target.next().after(target);
				});
				//显示隐藏节点
				$(element).on("click",".btn-showdetail-job",function(){
					var tip = $(this).attr("tip");
					var target = $(this).parents('tbody').find('.content');
					if(tip == 1) {
						$(this).attr("tip","2");
						target.hide();
					}else {
						$(this).attr("tip","1");
						target.show();
					}
				});
				//全部显示隐藏节点
				$(element).on("click",".btn-job-show-all",function(){
					var icon = $(this).find("i.fa");
					icon.toggleClass('fa-chevron-down fa-chevron-up');
					var target = $(this).parents('.step');
					if(icon.hasClass('fa-chevron-up')){
						target.find('.btn-showdetail-job').attr("tip","1");
						target.find('.content').show();
					}else{
						target.find('.btn-showdetail-job').attr("tip","2");
						target.find('.content').hide();
					}
				});
				//输入名称时显示详情
				$(element).on("focus","input[name='jobname']",function(){
					var target = $(this).parents('.job');
					target.find('.content').show();
					target.find('.btn-showdetail-job').attr("tip","1");
				});
			}
		}
	}]);
	//job元素拖拽操作
	app.directive('ngDragJob', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
		return {
			restrict: 'EA',
			scope:{},
			link: function (scope, element, attrs) {
				var container = $('.drag-container');
				$(element).draggable({
					start: function(){
						var _target = $(this);
						container.fadeIn(500);
						_target.addClass('drag-item');
						_target.closest('.step').addClass('current-step');
						// //根据当前拖动图标获取当前节点及步骤索引
						var steps = $('.step-content');
						var blocks = container.find('div.drag-step-cell');
						steps.find('.step').each(function(i){
							var name = $.trim($(this).find('input.task-name-input').val());
							if(name){
								if(name.length>10){
									blocks.eq(i).text(name.slice(0,10)+' ...');
								}else{
									blocks.eq(i).text(name);
								}
							}else{
								blocks.eq(i).text('步骤'+(i+1));
							}
						});
					},
					stop: function(){
						var _target = $(this);
						var _dragIcon = _target.find('.fa');
						_dragIcon.animate({width:0,height:1,opacity: 0},500,function(){
							_target.attr('style','position: relative;').removeClass('drag-item');
							_dragIcon.removeAttr('style');
						});
						//根据当前拖动图标获取当前节点及步骤索引
						var steps = $('.step-content');
						var job = _target.closest('tbody.job');//当前拖动的节点
						var step = job.closest('.step');//当前拖动节点的步骤
						var n_type = step.attr('type');//当前拖动节点步骤的类型
						var n_index = step.index();//步骤索引
						$('.step').removeClass('current-step');
						//获取拖放至的block节点
						var _block_active = container.find('div.block-active');
						var b_type = _block_active.attr('type');
						//活动block生效
						if(b_type){
							if(b_type==n_type){
								var b_index = _block_active.index();
								if(n_index!=b_index){
									steps.find('.step').eq(b_index).find('.task-node>table').append(job);
								}
								_block_active.removeClass('.block-hover');
							}else{
								$timeout(function(){
									$rootScope.pop('步骤类型不一致','error');
								});
							}
						};
						setTimeout(function(){
							container.fadeOut(500);
						},1000);
						
					}
				});
			}
		}
	}]);
	app.directive('ngDragModal', ['$rootScope',  function ($rootScope) {
		return {
			restrict: 'EA',
			scope:{},
			link: function (scope, element, attrs) {
				//拖拽里新增内容
				var type = element.parents('.step').attr('type'),className;
				switch(type){
					case 'script':
						className = 'drag-type-j';
						break;
					case 'file':
					case 'backup':
						className ="drag-type-f";
						break;
				}
				$('.drag-step-list').append('<div class="drag-step-cell '+className+'" type="'+type+'"></div>');
				$('.drag-step-cell').droppable({
					over: function(){
						var steps = $('.step-content');
						var target = $(this);
						var b_type = target.attr('type');
						var n_type = steps.find('.step.current-step').attr('type');
						$('.drag-step-list>.drag-step-cell').removeClass('block-hover');
						if (b_type == n_type){
							target.addClass('block-hover');
						}
					},
					drop: function(event, obj){
						var target = $(this);
						$(this).addClass('block-active');
						target.removeClass('block-hover');
						setTimeout(function(){
							target.removeClass('block-active');
						},1500);
						return false;
					}
				});
			}
		}
	}]);
	//使元素滚动到指定位置 by Haijun Zhang 2016-09-21
	(function($){
		$.fn.scrollGotoHere = function(){
			var heightPx = $(this).offset().top;
			if(heightPx){
				heightPx=heightPx-150
			}
			$('html,body').animate({scrollTop: heightPx+'px'}, 200);
		};
	})(jQuery);
	//任务类的验证
	app.directive('ngValidatorPopover', ['$rootScope',  function ($rootScope) {
		return {
			restrict: 'EA',
			scope:{
				$invalid:'='
			},
			link: function (scope, element, attrs) {
				var targets = $(element).parents('form[name="'+attrs.ngValidatorPopover+'"]');//获取验证的表单
				var showPopover = function(target,targets){
					var dom = target.parents('.content');
					if(dom.length > 0) {//当报错内容隐藏时将其置为显示并且更改按钮状态
						dom.show();
						dom.parents(".job").find('.btn-showdetail-job').attr("tip","1");
					};
					target.popover({"viewport":false}).popover('show');
					target.scrollGotoHere();
					targets.on('click',function () {
						target.popover('hide');
						scope.$apply(function(){
							scope.$invalid = false;
						});
					});
					scope.$apply(function () {
						scope.$invalid = true;
					});
				};//显示报错信息方法
				$(element).on('click',function($event){
					$event.stopPropagation();//阻止事件冒泡
					targets.find('[data-content]').each(function (item) {//验证的元素
						var target = $(this);
						if(target.hasClass('code-type')){//代码在线编辑器验证
							var  value = target.data('codeMirror').getValue();
							if(!value) {
								showPopover(target,targets);
								return false;
							}
						} else if(target.is('input,select')){//普通验证
							if(target.attr('disabled')=='disabled') return;
							var value = target.val();
							if(!value) {
								showPopover(target,target);
								return false;
							}
						}else {
							var value = target.attr("value");
							if(!value || value == '0') {
								showPopover(target,target);
								return false;
							}
						}
					});
				})
			}
		}
	}]);
	// -------------------------任务改版-------------------------------------
	//任务页面跳转
	app.directive('ngTaskMainRouterCopy', ['$rootScope', 'httpLoad', function ($rootScope, httpLoad) {
		return {
			restrict: 'EA',
			scope:false,
			link: function (scope, element, attrs) {
				$rootScope.link = '/statics/css/task.css';
				//控制页面跳转
				scope.routerStatus = 1;
				scope.goTaskDetail = function(id){
					httpLoad.loadData({
						url:'/record/task',
						method:'GET',
						data:{id:id},
						success:function(data){
							if(data.success){
								scope.goPage(3);
								scope.currentRecordId = id;
								scope.detailData = data.data;
							}
						}
					});
				};
				scope.execute = function(){
					httpLoad.loadData({
						url:'/task/graph/start',
						method:'POST',
						data:{id:scope.detailData.id},
						success:function(data){
							if(data.success){
								scope.goPage(3);
								scope.currentRecordId = data.data;
							}
						}
					});
				};
				scope.goPage = function(flag){
					scope.routerStatus = flag;
				};
				scope.goPreviewTask = function(id){
					httpLoad.loadData({
						url:'/task/graph/detail',
						method:'GET',
						data:{id:id},
						success:function(data){
							if(data.success){
								scope.goPage(2);
								scope.detailData = data.data;
							}
						}
					});
				};
				scope.goJobDetail = function(id){//跳转到执行详情
					scope.goPage(4);
					scope.currentJobId = id;
				}
			}
		}
	}]);
	//在线编辑指令->任务改版
	app.directive('ngCodeMirrorCopy', ['$timeout', function ($timeout) {
		return {
			restrict: 'EA',
			scope:{
				codeMirror: '='
			},
			link: function (scope, element, attrs) {
				var editor = $(element).find('.textarea')[0];
				//解决异步加载bug
				$timeout(function () {
					scope.codeMirror = CodeMirror.fromTextArea(editor, {
						theme: 'erlang-dark',
						mode: 'shell',
						lineNumbers: true,
						readOnly: false,
						extraKeys: {
							"F11": function(cm) {
								cm.setOption("fullScreen", !cm.getOption("fullScreen"));
							},
							"Esc": function(cm) {
								if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
							}
						}
					});
					$(element).find('.code-type').data('codeMirror',scope.codeMirror);
				});
				//全屏展示
				$(element).find('.icon-size-fullscreen').on('click',function(){
					var escTip =  $('<div style="z-index:10000;font-size:16px;color:#f05050;position: fixed;top: 10px;left:50%;text-align: center;opacity: 1;font-weigth:bold;background-color: #e7fff8;padding:5px;width:400px;margin-left:-200px;">您现在处于全屏模式，按ESC键可以退出全屏！</div>');
					$(document.body).append(escTip);
					escTip.animate({
						opacity : '0'
					},5000,function(){
						escTip.remove();
					});
					scope.codeMirror.setOption("fullScreen", true);
				});
			}
		}
	}]);
	//任务详情预览
	app.directive('ngTaskPreviewDetail', [function () {
		return {
			restrict: 'EA',
			templateUrl:'/statics/tpl/operation/template/taskPreviewDetail.html',
			scope:true,
			link: function (scope, element, attrs) {
				var TaskPreview = function () {
					this.InitContent();
				}
				TaskPreview.prototype = {
					InitContent:function(){
						this.scene = new JTopo.Scene();
						this.scene.background = '/statics/img/topology/bg.jpg';
						var canvas = document.getElementById('canvasdetail');
						canvas.height = window.innerHeight * 0.5;
						canvas.width = window.innerWidth * 0.80;
						this.stage = new JTopo.Stage(canvas);
						this.stage.eagleEye.visible = true;
						this.stage.add(this.scene);
					},
					//初始绘制节点
					DrawNode:function(data){
						var that = this;
						var img = {
							START:'start_normal.png',
							END:'end_normal.png',
							SCRIPT:'script_normal.png',
							FILE:'file_normal.png',
							BACKUP:'backup_normal.png'
						};
						data.nodes.forEach(function(item){
							if(item.start){
								that.AddNode(item.location.x,item.location.y,'开始节点',img.START,'Bottom_Center','START',item);
							}else	if(item.end){
								that.AddNode(item.location.x,item.location.y,'结束节点',img.END,'Bottom_Center','END',item);
							}else {
								that.AddNode(item.location.x,item.location.y,item.data.name,img[item.data.type],'Bottom_Center',item.data.type,item);
							}
						});
						data.links.forEach(function (item) {
							var nodeA = that.scene.findElements(function (e) {
								return e.id == item.nodeAid;
							});
							var nodeZ = that.scene.findElements(function (e) {
								return e.id == item.nodeZid;
							});
							if (nodeA[0] && nodeZ[0]) {
								that.AddLink(nodeA[0], nodeZ[0], item.text);
							}
						});
					},
					//添加节点
					AddNode:function(x, y, str, img, textPosition, nodeType, nodeData){
						var node = new JTopo.Node(str);
						node.setLocation(x, y);
						node.id = nodeData.nodeId;
						node.nodeData = nodeData.data;
						node.nodeType = nodeType;
						node.setImage('/statics/img/topology/' + img, false);
						node.Image = img;
						node.textPosition = textPosition;//设置文字位置
						node.fontColor = '88,102,110';//设置文字颜色
						node.setSize(80,80);//设置图标大小
						this.EveSetNode(node);
						this.scene.add(node);
						return node;
					},
					//添加连线
					AddLink:function(nodeA,nodeZ,str){
						var link = new JTopo.Link(nodeA, nodeZ, str);
						link.lineWidth = 3;//线宽
						link.bundleGap = 20;//线条之间的间隔
						link.textOffsetY = 3;//文本偏移量（向下3个像素）
						link.arrowsRadius = 10;//箭头大小
						link.fontColor = '0, 200, 255';//字体颜色
						link.strokeColor = '0, 200, 255';//线条颜色
						this.scene.add(link);
					},
					//对内容节点的操作
					EveSetNode:function(node){
						//双击
						node.addEventListener('click', function (event) {
							scope.$apply(function(){
								if(node.nodeData) {
									scope.isShowInfo = true;
									scope.nodeData = node.nodeData;
								}
							})
						});
					},
				};
				var TaskPreview = new TaskPreview();
					TaskPreview.DrawNode(angular.fromJson(scope.detailData.graph));
			}
		}
	}]);
	//任务执行详情
	app.directive('ngTaskExecuteDetail', ['httpLoad', 'webSocket', '$modal', function (httpLoad, webSocket, $modal) {
		return {
			restrict: 'EA',
			templateUrl:'/statics/tpl/operation/template/taskExecuteDetail.html',
			scope:true,
			link: function (scope, element, attrs) {
				var TaskExecute = function () {
					this.InitContent();
					this.EveSet();
				}
				TaskExecute.prototype = {
					InitContent:function(){
						this.scene = new JTopo.Scene();
						this.scene.background = '/statics/img/topology/bg.jpg';
						var canvas = document.getElementById('canvasexecute');
						canvas.height = window.innerHeight * 0.5;
						canvas.width = window.innerWidth * 0.80;
						this.stage = new JTopo.Stage(canvas);
						this.stage.eagleEye.visible = true;
						this.stage.add(this.scene);
					},
					//初始绘制节点
					DrawNode:function(data,taskStatus){
						var that = this;
						that.scene.clear();
						var img = {
							START:'start',
							END:'end',
							SCRIPT:'script',
							FILE:'file',
							BACKUP:'backup',
							RECOVERY:'backup'
						};
						var status={
							SUCCESS:'_success.png',
							FAIL:'_fail.png',
							PAUSED:'_suspend.png',
							RUNNING:'_running.png'
						};
						data.nodes.forEach(function(item){
							if(item.start){
								var image = taskStatus == 'FAIL' ? 'start_fail.png' : 'start_success.png';
								that.AddNode(item.location.x,item.location.y,'开始节点',image,'Bottom_Center','START',item);
							}else	if(item.end){
								var image = taskStatus == 'FAIL' ? 'end_fail.png' : 'end_success.png';
								that.AddNode(item.location.x,item.location.y,'结束节点',image,'Bottom_Center','END',item);
							}else {
								var image = img[item.record.type]+(status[item.record.status] || '_normal.png');
								that.AddNode(item.location.x,item.location.y,item.record.name,image,'Bottom_Center',item.record.type,item);
							}
						});
						data.links.forEach(function (item) {
							var nodeA = that.scene.findElements(function (e) {
								return e.id == item.nodeAid;
							});
							var nodeZ = that.scene.findElements(function (e) {
								return e.id == item.nodeZid;
							});
							if (nodeA[0] && nodeZ[0]) {
								that.AddLink(nodeA[0], nodeZ[0], item.text);
							}
						});
					},
					//添加节点
					AddNode:function(x, y, str, img, textPosition, nodeType, nodeData){
						var node = new JTopo.Node(str);
						node.setLocation(x, y);
						node.id = nodeData.nodeId;
						node.nodeData = nodeData.record;
						node.nodeType = nodeType;
						node.setImage('/statics/img/topology/' + img, false);
						node.Image = img;
						if(node.nodeData && scope.taskDetailData.status == 'PAUSED' && node.nodeData.suspended){
							this.nodeFlash = setInterval(function(){
								if(node.alarm) {
									node.alarm = null;
								}else{
									node.alarm = '需操作';
								}
							},600)
							this.EveSetRight(node);
						}
						node.textPosition = textPosition;//设置文字位置
						node.fontColor = '88,102,110';//设置文字颜色
						node.setSize(80,80);//设置图标大小
						this.EveSetNode(node);
						this.scene.add(node);
						return node;
					},
					RemoveEve:function(){
						clearInterval(this.nodeFlash);
						this.currentNode.alarm = null;
						this.currentNode.removeEventListener('mouseup');
					},
					//添加连线
					AddLink:function(nodeA,nodeZ,str){
						var link = new JTopo.Link(nodeA, nodeZ, str);
						link.lineWidth = 3;//线宽
						link.bundleGap = 20;//线条之间的间隔
						link.textOffsetY = 3;//文本偏移量（向下3个像素）
						link.arrowsRadius = 10;//箭头大小
						link.fontColor = '0, 200, 255';//字体颜色
						link.strokeColor = '0, 200, 255';//线条颜色
						this.scene.add(link);
					},
					//对内容节点的操作
					EveSetNode:function(node){
						//双击
						node.addEventListener('click', function (event) {
							scope.$apply(function(){
								if(node.nodeData) {
									scope.isShowInfo = true;
									scope.currentJobId = node.nodeData.id;
									getJobDetail();
								}
							})
						});
					},
					EveSetRight:function(node){
						var that = this;
						node.addEventListener('mouseup', function (event) {
							$(".node-menu").hide();
							if (event.button == 2) {//右键
									$("#contextmenu").css({
										top: event.offsetY,
										left: event.offsetX + 20
									}).show();
								that.currentNode = node;
							}
						});
					},
					//菜单
					EveSet:function () {
						var that = this;
						$("#contextmenu a").on('click',function (e) {
							var tip = $(this).attr('tip');
							switch(tip/1){
								case 1:
									scope.continue(that.currentNode);
									break;
								case 2:
									scope.cancel(that.currentNode);
									break;
							}
						});
						$(document).on('click',function () {
							$(".node-menu").hide();
						});
					}
				};
				var TaskExecute = new TaskExecute();
				scope.continue = function(node){
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/delModal.html',
						controller: 'delModalCtrl',
						backdrop: 'static',
						resolve:{
							tip: function () {
								return '你确定要继续该任务吗？';
							},
							btnList: function(){
								return [{name:'继续',type:'btn-primary'},{name:'取消',type:'btn-default'}];
							}
						}
					});
					modalInstance.result.then(function() {
						httpLoad.loadData({
							url:'/task/graph/active',
							method:'POST',
							data:{
								uuid: scope.taskDetailData.uuid,
								jrId: node.nodeData.id,
								trId: scope.taskDetailData.id
							},
							success:function(data){
								if(data.success){
									TaskExecute.RemoveEve();
									scope.pop('任务继续');
								}
							}
						});
					});
				};
				scope.cancel = function(node){
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/delModal.html',
						controller: 'delModalCtrl',
						backdrop: 'static',
						resolve:{
							tip: function () {
								return '你确定要取消该任务吗？';
							},
							btnList: function(){
								return [{name:'确认',type:'btn-danger'},{name:'关闭',type:'btn-default'}];
							}
						}
					});
					modalInstance.result.then(function() {
						httpLoad.loadData({
							url:'/task/graph/cancel',
							method:'POST',
							data:{
								uuid: scope.taskDetailData.uuid
							},
							success:function(data){
								if(data.success){
									TaskExecute.RemoveEve();
									scope.pop('任务取消');
								}
							}
						});
					});
				};
				var startWebSocket = function () {
					webSocket.loadData({
						message:function(data){
							if(data.taskId == scope.currentRecordId){
								getTaskDetail();
							}
							if(scope.currentJobId && data.jobId == scope.currentJobId){
								getJobDetail();
							}
						}
					});
				};
				var getTaskDetail = function(){
					httpLoad.loadData({
						url:'/record/graph/task',
						method:'GET',
						data:{id:scope.currentRecordId},
						success:function(data){
							if(data.success){
								scope.taskDetailData = data.data;
								TaskExecute.DrawNode(angular.fromJson(scope.taskDetailData.graph),scope.taskDetailData.status);
								if(scope.taskDetailData.status != 'SUCCESS' ||  scope.taskDetailData.status != 'FAIL'){
									startWebSocket();
								}
							}
						}
					});
				};
				getTaskDetail();
				scope.param = {
					page:1,
					rows:5
				}
				//获取log详情
				scope.loadDetailLog = function(key,result){
					for(var a in scope.executeList){
						scope.executeList[a].isSelect = false;
					}
					scope.executeList[key].isSelect = true;
					scope.logDetail = JSON.parse(result);
				}
				scope.getExecuteList = function(page,status){
					scope.param.page = page || scope.param.page;
					scope.params[0].param.status = status || scope.params[0].param.status;
					scope.param.params = JSON.stringify(scope.params);
					httpLoad.loadData({
						url:'/record/graph/results',
						data:scope.param,
						noParam:true,
						success:function(data){
							if(data.success){
								scope.executeList = data.data.rows;
								scope.totalLog = data.data.total;
								scope.loadDetailLog(0,scope.executeList[0].result);
							}
						}
					})
				};
				var getJobDetail = function() {
					httpLoad.loadData({
						url:'/record/graph/job',
						data:{
							id: scope.currentJobId
						},
						method:'GET',
						success:function(data){
							if(data.success){
								scope.jobDetailData = data.data;
								scope.params = [{param:{jrId:scope.jobDetailData.id},sign:'EQ'}];
							}
						}
					});
				};
			}
		}
	}]);
})();
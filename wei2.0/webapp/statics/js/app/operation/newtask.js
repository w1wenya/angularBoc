/**
 * Created by Zhang Haijun on 2016/8/15.
 */
(function(){
	"use strict";
	app.controller('NewTaskCtrl', ['$scope', 'httpLoad', '$rootScope', '$compile', '$timeout','$state', '$stateParams',
		function($scope, httpLoad, $rootScope, $compile, $timeout, $state, $stateParams) {
			$rootScope.link = '/statics/css/task.css';
			$scope.taskFlag = $stateParams.flag;
			var 	getDataUrl,saveUrl;
			//获取模板列表
			var getTplList = function(){
				httpLoad.loadData({
					url: '/task/list',
					data:{
						params:JSON.stringify([{"param":{"kind":"TEMPLATE"},"sign":"EQ"}]),
						simple:true
					},
					noParam: true,
					success:function(data){
						if(data.success){
							$scope.tplListData = data.data.rows;
						}
					}
				})
			};
			$scope.selectTpl = function(){
				if($scope.tplId) {
					angular.element('.step-content').empty();
					getEditData($scope.tplId);
				};
			};
			//获取编辑数据
			var getEditData = function(id){
				//对编辑数据进行处理回现
				var operationData = function(data){
					if('25711'.indexOf($stateParams.flag) > -1) $scope.name = data.name;
					$scope.remark = data.remark;
					for(var i in data.steps){
						var datas = data.steps[i];
						if(datas.type == 'SCRIPT'){
							$scope.addStep(1);
						}else if(datas.type == 'FILE') {
							$scope.addStep(2);
						}else $scope.addStep(3);
						var target = $('.step').last();
						target.data('itemData',datas);
					}
				}
				httpLoad.loadData({
					url: getDataUrl,
					data:{id:id || $scope.taskId},
					method:'GET',
					success:function(data){
						if(data.success){
							operationData(data.data)
						}
					}
				})
			};
			//添加步骤
			$scope.addStep = function (flag) {
				switch(flag){
					case 1:
						$('.step-content').append($compile('<div class="col-md-12 step" ng-script-task="" type="script" ></div>')($scope));
						break;
					case 2:
						$('.step-content').append($compile('<div class="col-md-12 step"  ng-file-task="" type="file"></div>')($scope));
						break;
					case 3:
						$('.step-content').append($compile('<div class="col-md-12 step"  ng-backup-task="" type="backup"></div>')($scope));
						break;
				}
			};
			//判断当前页面
			(function(){
				switch($stateParams.flag/1){
					case 1:
						$rootScope.moduleTitle = '运维中心 > 新建任务';
						$scope.showTpl = true;
						$scope.kind = 'GENERAl';getTplList();
						getDataUrl = '/task/clone';saveUrl = '/task/create';
						$scope.pageGo = 'app.operation.tasklist';
						break;
					case 2:
						$rootScope.moduleTitle = '运维中心 > 修改任务';
						$scope.kind = 'GENERAl';
						getDataUrl = '/task/detail';saveUrl = '/task/modify';
						$scope.taskId= $stateParams.id;
						$scope.pageGo = 'app.operation.tasklist';
						getEditData();
						break;
					case 3:
						$rootScope.moduleTitle = '运维中心 > 任务克隆';
						$scope.kind = 'GENERAl';
						getDataUrl = '/task/clone';saveUrl = '/task/create';
						$scope.pageGo = 'app.operation.tasklist';
						getEditData($stateParams.id);
						break;
					case 4:
						$rootScope.moduleTitle = '运维中心 > 新建备份任务';
						$scope.kind = 'BACKUP';
						$scope.hideFun = true;
						saveUrl = '/task/create';
						$scope.pageGo = 'app.operation.backupRecovery';
						break;
					case 5:
						$rootScope.moduleTitle = '运维中心 > 修改备份任务';
						$scope.kind = 'BACKUP';
						$scope.hideFun = true;
						getDataUrl = '/task/detail';saveUrl = '/task/modify';
						$scope.taskId= $stateParams.id;
						$scope.pageGo = 'app.operation.backupRecovery';
						getEditData();
						break
					case 6:
						$rootScope.moduleTitle = '运维中心 > 备份任务克隆';
						$scope.kind = 'BACKUP';
						$scope.hideFun = true;
						getDataUrl = '/task/clone';saveUrl = '/task/create';
						$scope.pageGo = 'app.operation.backupRecovery';
						getEditData($stateParams.id);
						break;
					case 7:
						$rootScope.moduleTitle = '应用中心 > 简单部署';
						var ids =  $stateParams.id.split('$');
						$scope.appId= ids[0];	var id = ids[1];
						getDataUrl = '/task/clone';saveUrl = '/app/execute';
						$scope.isHideSave = true;
						$scope.pageGo = 'app.application.deploy';
						getEditData(id);
						break;
					case 8:
						$rootScope.moduleTitle = '应用中心 > 部署应用';
						$scope.appId= $stateParams.id;
						getDataUrl = '/task/clone';saveUrl = '/app/deploy/create';
						$scope.isHideExecute = true;
						$scope.pageGo = 'app.application.deploy';
						break;
					case 9:
						$rootScope.moduleTitle = '应用中心 > 部署编辑';
						var ids =  $stateParams.id.split('$');
						$scope.appId= ids[0];	$scope.taskId= ids[1];
						getDataUrl = '/task/detail';saveUrl = '/task/modify';
						$scope.isHideExecute = true;
						$scope.pageGo = 'app.application.deploy';
						getEditData();
						break;
					case 10:
						$rootScope.moduleTitle = '运维中心 > 新增模板';
						$scope.kind = 'TEMPLATE';$scope.isTpl = true;
						$timeout(function(){
							$scope.addStep(1);
						},10);
						saveUrl = '/task/create';
						$scope.isHideExecute = true;
						$scope.pageGo = 'app.operation.tasktpl';
						break;
					case 11:
						$rootScope.moduleTitle = '运维中心 > 修改模板';
						$scope.kind = 'TEMPLATE';$scope.isTpl = true;
						getDataUrl = '/task/detail';saveUrl = '/task/modify';
						$scope.taskId= $stateParams.id;
						$scope.isHideExecute = true;
						$scope.pageGo = 'app.operation.tasktpl';
						getEditData();
						break;
				}
			})();
			$scope.goList = function(){
				$state.go($scope.pageGo)
			};
			//执行脚本
			$scope.execute = function(flag){
				if($scope.$invalid) return;//表单验证不通过，直接return;
				//数据处理
				var postData;
				var operationData = function () {
					 postData = [];
					$('.step').each(function (index) {
						var itemData = $(this).data('itemData');
						itemData.jobs = [];postData.push(itemData);
						$(this).find('.job').each(function () {
							postData[index].jobs.push($(this).data("itemData"));
						});
					});
					console.log(postData)
				}
				$timeout(function(){
				  operationData();
				  var data = {
							name: $scope.name,
					    remark:$scope.remark,
							type: "REAL",
							kind: $scope.kind,
							steps:postData  
				  };
				  if($scope.taskId) data.id = $scope.taskId;
					if($scope.appId) data.appId = $scope.appId;
				  httpLoad.loadData({
						url: saveUrl,
						data:data,
						method:'POST',
						success:function(data){
							if(data.success){
								if(flag){
									$state.go($scope.pageGo);
								}else{//部署应用直接跳到详情
									if($scope.isHideSave) $scope.goTaskDetail(data.data);
									else $scope.goPreviewTask($scope.taskId || data.data.id);//区分编辑和创建传递id的方式
								}
							}
						}
				  })
				},100)
			}
		}
	]);
})();
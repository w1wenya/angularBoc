/**
 * Created by Zhang Haijun on 2016/10/28.
 */
(function(){
	"use strict";
	app.controller('MonitorManageListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE) {
			$rootScope.moduleTitle = '参数管理 > 指标管理';//定义当前页
			$scope.param = {
				page: 1,
				rows: 10
			};
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/measure/list',
					method:'POST',
					noParam: true,
					data:$scope.param,
					success:function(data){
						if(data.success){
							$scope.listData = data.data.rows;
							$scope.totalPage = data.data.total;
						}
					}
				});
			}
			$scope.getList();
			//对参数进行处理，去除空参数
			var toObjFormat = function(obj) {
				for (var a in obj) {
					if (obj[a] == "") delete obj[a];
				}
				return obj;
			};
			//搜索
			$scope.search = function(){
				//对时间进行处理
				var toFormatTime = function(time, place) {
					if (!time) return "";
					var date = time.split(' - ');
					return date[place/1];
				}
				var params = [];
				var param1 = toObjFormat({
					name:$scope.name,
					item:$scope.item
				});
				if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
				if ($scope.date) {
					params.push({param: {gmtCreate: toFormatTime($scope.date, 0)}, sign: 'GET'});
					params.push({param: {gmtCreate: toFormatTime($scope.date, 1)}, sign: 'LET'});
				}
				$scope.param = {
					page: 1,
					rows: 10,
					params: angular.toJson(params)
				}
				$scope.getList(1)
			}
			//重置搜索条件
			$scope.reset = function(){
				var obj = ['name','item','date'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//添加\编辑
			$scope.create = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/monitor/measure/manage/addModal.html',
					controller: 'addMonitorModalCtrl',
					backdrop: 'static',
					resolve: {
						id: function() {
							return id || '';
						}
					}
				});
				modalInstance.result.then(function(data) {
					$scope.getList();
				});
			}
			//采集间隔下发
			$scope.time = function(){
				$state.go('app.config.measurereTime');
			}
			//详情
			$scope.detail = function(id){
				$modal.open({
					templateUrl: '/statics/tpl/monitor/measure/manage/detailModal.html',
					controller: 'detailMonitorModalCtrl',
					backdrop: 'static',
					resolve: {
						id: function() {
							return id;
						}
					}
				});
			}
			//删除
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要删除该监控项吗？';
						},
						btnList: function () {
							return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/measure/remove',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.MONITOR.MANAGE.DEL_SUCCESS);
								$scope.getList();
							}
						}
					});
				});
			};
			//详情
			$scope.goDetail = function(flag,id){
				switch (flag/1){
					case 1:
						$state.go('app.config.measureitem',{id:id});
						break;
					case 2:
						$state.go('app.config.measureplugin',{id:id});
						break;
					case 3:
						$state.go('app.config.measureupload',{id:id.id});
						sessionStorage.setItem('measureItem',id.name)
						break;
					case 4:
						$state.go('app.config.measurerecord',{id:id});
						break;
				}
			}
		}
	]);
//添加\编辑ctrl
	app.controller('addMonitorModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id', 'LANGUAGE',
		function($scope, $modalInstance,  httpLoad, id, LANGUAGE) {
			$scope.modalName = '添加监控项';
			var editObj = ['name','item','remark'];
			var url = '/measure/create';
			//如果为编辑，进行赋值
			if(id){
				url = '/measure/modify';
				$scope.modalName = '编辑监控项';
				httpLoad.loadData({
					url: '/measure/detail',
					method: 'GET',
					data: {id: id},
					success: function(data){
						if(data.success){
							var data = data.data;
							for(var a in editObj){
								var attr = editObj[a];
								$scope[attr] = data[attr];
							};
						}
					}
				});
			}
			//保存按钮
			$scope.ok = function(){
				var param = {};
				for(var a in editObj){
					var attr = editObj[a];
					param[attr] = $scope[attr];
				}
				if(id) param.id = id;
				httpLoad.loadData({
					url: url,
					data: param,
					success: function(data){
						if(data.success){
							var popText = LANGUAGE.MONITOR.MANAGE.ADD_SUCCESS;
							if(id) popText = LANGUAGE.MONITOR.MANAGE.EDIT_SUCCESS;
							$scope.pop(popText);
							$modalInstance.close(data);
						}
					}
				});
			}
			$scope.cancle = function() {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	app.controller('detailMonitorModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
		function($scope, $modalInstance,  httpLoad, id) {
			httpLoad.loadData({
				url: '/measure/detail',
				method: 'GET',
				data: {id: id},
				success: function (data) {
					if (data.success) {
						$scope.detailData = data.data;
					}
				}
			});
			$scope.cancle = function() {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
})()


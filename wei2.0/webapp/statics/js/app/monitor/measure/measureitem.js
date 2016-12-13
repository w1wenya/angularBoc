/**
 * Created by Zhang Haijun on 2016/10/28.
 */
(function(){
	"use strict";
	app.controller('MonitorItemListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','$stateParams','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, $stateParams, LANGUAGE) {
			$rootScope.moduleTitle = '监控中心 > 监控子项管理';//定义当前页
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson([{param:{measureId:$stateParams.id},sign:'EQ'}])
			}
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/measure/item/list',
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
				// //对时间进行处理
				// var toFormatTime = function(time, place) {
				// 	if (!time) return "";
				// 	var date = time.split(' - ');
				// 	return date[place/1];
				// }
				var params = [];
				var param1 = toObjFormat({
					name:$scope.name
				});
				var param2 = toObjFormat({
					measureId:$stateParams.id
				});
				if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
				if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
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
				var obj = ['name'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//添加\编辑
			$scope.create = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/monitor/measure/measureitem/addModal.html',
					controller: 'addMonitorItemModalCtrl',
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
			//删除
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要删除该监控子项吗？';
						},
						btnList: function () {
							return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/measure/item/remove',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.MONITOR.ITEM.DEL_SUCCESS);
								$scope.getList();
							}
						}
					});
				});
			};
			//详情
			$scope.goDetail = function(flag){
				switch (flag/1){
					case 1:
						$state.go('app.application.measureitem',{id:id});
						break;
				}
			
			};
			$scope.goBack = function(){
				$state.go('app.monitor.measure');
			};
		}
	]);
//添加\编辑ctrl
	app.controller('addMonitorItemModalCtrl', ['$scope', '$modalInstance', '$stateParams','httpLoad', 'id', 'LANGUAGE',
		function($scope, $modalInstance, $stateParams, httpLoad, id, LANGUAGE) {
			$scope.modalName = '添加监控子项';
			var editObj = ['name','item'];
			var url = '/measure/item/create';
			//如果为编辑，进行赋值
			if(id){
				url = '/measure/item/modify';
				$scope.modalName = '编辑监控项';
				httpLoad.loadData({
					url: '/measure/item/detail',
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
				var param = {
					measureId:$stateParams.id
				};
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
							var popText = LANGUAGE.MONITOR.ITEM.ADD_SUCCESS;
							if(id) popText = LANGUAGE.MONITOR.ITEM.EDIT_SUCCESS;
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
})()


/**
 * Created by Zhang Haijun on 2016/10/14.
 */
(function(){
	"use strict";
	app.controller('AlarmManageListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE','CommonData',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE, CommonData) {
			$rootScope.moduleTitle = '告警中心 > 告警管理';//定义当前页
			$scope.statusData = CommonData.alarmStatus;
			$scope.levelData = CommonData.alarmLevel;
			$scope.param = {
				page: 1,
				rows: 10,
			}
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/alarm/list',
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
					measurement:$scope.measurement,
					host:$scope.host
				});
				var param2 = toObjFormat({
					status: $scope.status,
					level: $scope.level
				});
				if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
				if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
				if ($scope.date) {
					params.push({param: {occurred: toFormatTime($scope.date, 0)}, sign: 'GET'});
					params.push({param: {occurred: toFormatTime($scope.date, 1)}, sign: 'LET'});
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
				var obj = ['name','level','date','status','host','measurement'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//删除
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你要确认该警告信息吗？';
						},
						btnList: function () {
							return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/alarm/remove',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.ALARM.MANAGE.DEL_SUCCESS);
								$scope.getList();
							}
						}
					});
				});
			};
			//解决告警
			$scope.solve = function(item){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/alarm/manage/solveModal.html',
					controller: 'solveAlarmModalCtrl',
					backdrop: 'static',
					resolve: {
						id: function() {
							return item.id;
						}
					}
				});
				modalInstance.result.then(function(data) {
					item.status = 'SOLVED';
					item.solveUser = $rootScope.userData.name;
				});
			}
			//确认警告
			$scope.confirm = function(item){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你要确认该警告吗？';
						},
						btnList: function () {
							return  [{name:'确认',type:'btn-primary'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/alarm/confirm',
						data: {id:item.id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.ALARM.MANAGE.CONFIRM_SUCCESS);
								item.status = 'CONFIRMED';
								item.confirmUser = $rootScope.userData.name;
							}
						}
					});
				});
			};
			//详情
			$scope.goDetail = function(id){
			 $state.go('app.alarm.managedetail',{id:id})
			}
		}
	]);
//解决告警
	app.controller('solveAlarmModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id', 'LANGUAGE',
		function($scope, $modalInstance,  httpLoad, id, LANGUAGE) {
				httpLoad.loadData({
					url: '/alarm/detail',
					method: 'GET',
					data: {id: id},
					success: function(data){
						if(data.success){
							$scope.detailData = data.data;
						}
					}
				});
			//保存按钮
			$scope.ok = function(){
				httpLoad.loadData({
					url: '/alarm/solve',
					data:{
						id:id,
						methodSolve:$scope.methodSolve
					},
					success: function(data){
						if(data.success){
							$scope.pop(LANGUAGE.ALARM.MANAGE.SLOVE_SUCCESS);
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


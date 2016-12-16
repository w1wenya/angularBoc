/**
 * Created by Zhang Haijun on 2016/6/16.
 */
(function(){
	"use strict";
    materialAdmin.controller('TaskTplCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state) {
			$rootScope.moduleTitle = '运维中心 > 任务模板';//定义当前页
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson([{param:{kind:'TEMPLATE'},sign:'EQ'}])
			}
			$scope.getTaskList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/task/graph/list',
					method:'POST',
					noParam: true,
					data:$scope.param,
					success:function(data){
						if(data.success){
							$scope.taskTplListData = data.data.rows;
							$scope.totalPage = data.data.total;
						}
					}
				});
			}
			$scope.getTaskList();
			//对参数进行处理，去除空参数
			var toObjFormat = function(obj) {
				for (var a in obj) {
					if (obj[a] == "") delete obj[a];
				}
				return obj;
			}
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
					name:$scope.name
				});
				var param2 = toObjFormat({
					kind: 'TEMPLATE',
					createrId: $scope.createrId || $scope.creator,
					menderId: $scope.menderId || $scope.menderId
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
				$scope.getTaskList(1)
			}
			$scope.addTpl = function (flag,id) {
				$state.go('application.tasktpl',{
					flag:flag,
					id:id
				});
			}
			//重置搜索条件
			$scope.reset = function(){
				var obj = ['name','creator','date','mender'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//自动填充创建人
			$scope.autoComplete = function(flag){
				if(flag){
					$scope.creator = $rootScope.userData.username;
				}else $scope.mender = $rootScope.userData.username
			}
			$scope.goEdit = function(id,flag){
						$state.go('basis.tasktpl',{
							flag:flag,
							id:id
						});
					};
			$scope.remove = function (id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/tasklist/delTaskModal.html',
					controller: 'delTaskModalCtrl',
					backdrop: 'static',
					resolve: {
						id: function() {
							return  id;
						},
					}
				});
				modalInstance.result.then(function() {
					$scope.getTaskList();
				});
			}
		}
	]);
	//删除任务ctrl
    materialAdmin.controller('delTaskModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
		function($scope, $modalInstance, httpLoad, id) {
			$scope.ok = function(){
				httpLoad.loadData({
					url: '/task/graph/remove',
					data: {id: id},
					success: function(data){
						if(data.success){
							$scope.pop('模板删除成功');
							$modalInstance.close();
						}
					}
				});
			}
			$scope.cancle = function(){
				$modalInstance.dismiss('cancel');
			};
		}
	]);
})()


/**
 * Created by Zhang Haijun on 2016/6/16.
 */
(function(){
	"use strict";
	app.controller('ApplicationDeploytCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE) {
			$rootScope.moduleTitle = '应用中心 > 应用部署';//定义当前页
			$scope.param = {
				page: 1,
				rows: 10,
			}
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/app/list',
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
				});
				var param2 = toObjFormat({
					createrId: $scope.createrId || $scope.creator,
					menderId: $scope.menderId || $scope.mender
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
				var obj = ['name','creator','date','mender'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//集成部署
			$scope.integratedDeploy = function (id) {
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要部署该应用吗？';
						},
						btnList: function () {
							return  [{name:'确定',type:'btn-primary'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/app/build',
						method:'GET',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.APPLICATION.MANAGE.DEPLOY_SUCCESS);
							}
						}
					});
				});
			}
			//部署
			$scope.goDeploy = function (item,flag) {
				if(flag) $state.go('app.application.newtask',{id:item.id+'$'+item.taskId,flag:7});
				else{
					if(item.taskId) $state.go('app.application.newtask',{id:item.id+'$'+item.taskId,flag:9});
					else $state.go('app.application.newtask',{id:item.id,flag:8});
				}
			};
			//详情
			$scope.goDetail = function(id){
				$state.go('app.application.history',{id:id});
			}
		}
	]);
})()


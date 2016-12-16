/**
 * Created by Zhang Haijun on 2016/9/22.
 */
(function(){
	"use strict";
	app.controller('DeployHistoryCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','CommonData','$stateParams',
		function($scope, httpLoad, $rootScope, $modal, $state, CommonData, $stateParams) {
			$rootScope.moduleTitle = '应用中心 > 部署历史';//定义当前页
			$scope.startWaysData = CommonData.startWaysData;
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson([{param:{appId:$stateParams.id},sign:'EQ'}])
			}
			$scope.getHistoryList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/app/records',
					method:'POST',
					noParam:true,
					data:$scope.param,
					success:function(data){
						if(data.success){
							$scope.historyListData = data.data.rows;
							$scope.totalPage = data.data.total;
						}
					}
				});
			}
			$scope.getHistoryList();
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
					name:$scope.name,
				});
				var param2 = toObjFormat({
					status:$scope.status,
					createrId: $scope.createrId || $scope.creator,
					menderId: $scope.menderId || $scope.menderId
				});
				if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
				if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
				if ($scope.date) {
					params.push({param: {startTime: toFormatTime($scope.date, 0)}, sign: 'GET'});
					params.push({param: {startTime: toFormatTime($scope.date, 1)}, sign: 'LET'});
				}
				$scope.param = {
					page: 1,
					rows: 10,
					params: angular.toJson(params)
				}
				$scope.getHistoryList(1)
			}
			//重置搜索条件
			$scope.reset = function(){
				var obj = ['name','creater','date','startWay'];
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
			$scope.goBack = function(){
				$state.go('app.application.deploy');
			}
		}
	]);
})()


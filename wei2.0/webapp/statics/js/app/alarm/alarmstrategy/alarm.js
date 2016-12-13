/**
 * Created by Zhang Haijun on 2016/10/14.
 */
(function(){
	"use strict";
	app.controller('AlarmListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE) {
			$rootScope.moduleTitle = '告警中心 > 告警策略';//定义当前页
			$rootScope.link = '/statics/css/alarm.css';//引入页面样式
			$scope.param = {
				page: 1,
				rows: 10,
			};
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/alarm/strategy/list',
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
					name:$scope.name,
				});
				var param2 = toObjFormat({
					level: $scope.level,
					appId: $scope.appId,
					dsId: $scope.dsId
				});
				if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
				if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
				$scope.param = {
					page: 1,
					rows: 10,
					params: angular.toJson(params)
				}
				$scope.getList(1)
			}
			//重置搜索条件
			$scope.reset = function(){
				var obj = ['name','level','appId','dsId'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//添加\编辑
			$scope.create = function(id){
				$state.go('app.alarm.addalarm',{id:id});
			}
			//删除告警策略
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你要确认该警告策略吗？';
						},
						btnList: function () {
							return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/alarm/strategy/remove',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.ALARM.ALARM.DEL_SUCCESS);
								$scope.getList();
							}
						}
					});
				});
			};
			//详情
			$scope.goDetail = function(flag,id){
				switch (flag){
					case 1:
						$state.go('app.alarm.alarmdetail',{id:id});
						break;
					case 2:
						$state.go('app.alarm.alarmupload',{id:id});
						break;
					case 3:
						$state.go('app.alarm.aurecord',{id:id});
						break;
				}
			}
		}
	]);
})()


/**
 * Created by Zhang Haijun on 2016/10/17.
 */
(function(){
	"use strict";
	app.controller('PluginListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE','CommonData',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE, CommonData) {
			$rootScope.moduleTitle = '参数管理> 日志插件';//定义当前页
			// $rootScope.link = '/statics/css/alarm.css';//引入页面样式
			$scope.pluginTypeData = CommonData.pluginType;
			$scope.param = {
				page: 1,
				rows: 10
			}
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/logplugin/list',
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
					type:$scope.type
				});
				if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
				if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
				// if ($scope.date) {
				// 	params.push({param: {gmtCreate: toFormatTime($scope.date, 0)}, sign: 'GET'});
				// 	params.push({param: {gmtCreate: toFormatTime($scope.date, 1)}, sign: 'LET'});
				// }
				$scope.param = {
					page: 1,
					rows: 10,
					params: angular.toJson(params)
				}
				$scope.getList(1)
			}
			//重置搜索条件
			$scope.reset = function(){
				var obj = ['name','type'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//详情
			$scope.goDetail = function(id){
				$state.go('app.config.plugindetail',{id:id})
			}
			//添加\编辑
			$scope.create = function(id){
				$state.go('app.config.plugincreate',{id:id})
			};
			//删除
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确认删除该插件吗？';
						},
						btnList: function () {
							return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/logplugin/remove',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.LOG.PLUGIN.DEL_SUCCESS);
								$scope.getList();
							}
						}
					});
				});
			};
		}
	]);
})()


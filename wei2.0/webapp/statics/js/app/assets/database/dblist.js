/**
 * Created by Zhang Haijun on 2016/10/14.
 */
(function(){
	"use strict";
	app.controller('DataBaseListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$stateParams','$timeout','$state','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal, $stateParams, $timeout, $state, LANGUAGE) {
			$rootScope.moduleTitle = '资源中心 > 数据库管理';
			$scope.param = {
				page: 1,
				rows: 10
			};
			$scope.platform = $stateParams.flag;
			//获取地域数据
			(function(){
				httpLoad.loadData({
					url:'/region/list',
					method: 'POST',
					data: {"id":$stateParams.id},
					success:function(data){
						if(data.success){
							$scope.regionData = data.data;
						}
					}
				});
			})();
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/db/ins/list',
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
			//添加
			$scope.create = function(id){
				$state.go('app.alarm.addalarm',{id:id});
			}
			//删除
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要删除该实例吗？';
						},
						btnList: function () {
							return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/db/ins/remove',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop('实例删除成功');
								$scope.getList();
							}
						}
					});
				});
			};
			//详情
			$scope.goDetail = function(flag,id){
			}
			//操作
			$scope.operation = function(flag,id){
				var restart = function(){
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/delModal.html',
						controller: 'delModalCtrl',
						backdrop: 'static',
						resolve:{
							tip: function () {
								return '你确定要重启该数据库吗？';
							},
							btnList: function () {
								return  [{name:'确定',type:'btn-primary'},{name:'取消',type:'btn-default'}];
							}
						}
					});
					modalInstance.result.then(function() {
						httpLoad.loadData({
							url: '/db/ins/reboot',
							data: {id:id},
							success: function(data){
								if(data.success){
									$scope.pop('数据库重启成功');
									$scope.getList();
								}
							}
						});
					});
				}
				switch (flag/1){
					case 1:
						restart();
						break;
					case 2 :
						$state.go('app.assets.database');
						break;
					case 3:
						$state.go('app.assets.dbdetail',{flag:$stateParams.flag,id:id});
						break;
					case 4:
						$state.go('app.assets.adddb',{flag:$stateParams.flag,id:$stateParams.id});
						break;
				}
				
			}
			$scope.sync = function(){
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/assets/database/syncModal.html',
					controller : 'SyncDataBaseModalCtrl',
				});
				modalInstance.result.then(function(){
					$scope.getList()
				});
			};
		}
	]);
	app.controller('SyncDataBaseModalCtrl',['$rootScope','$scope','$modalInstance','httpLoad','$stateParams',
		function($rootScope,$scope,$modalInstance,httpLoad,$stateParams){
			$scope.syncData = {};
			//获取可用区域数据
			(function(){
				httpLoad.loadData({
					url:'/region/list',
					method: 'POST',
					data: {"id":$stateParams.id},
					success:function(data){
						if(data.success){
							$scope.regionData = data.data;
							$scope.regionData.forEach(function(data,index){
								//默认选中第一个区域
								if(index==0){
									data.isRegionActive = true;
									$scope.syncData.region = data.id;
								}
								else data.isRegionActive = false;
							});
						}
					}
				});
			})();
			//选择可用区域
			$scope.chooseRegion = function(item){
				angular.forEach($scope.regionData, function(data,index){
					data.isRegionActive = false;
					if(data.id==item.id){
						data.isRegionActive = !item.isRegionActive;
					}
					if(data.isRegionActive){
						$scope.syncData.region = data.id;
					}
				});
			};
			$scope.ok = function(){
				$scope.syncData.id = $stateParams.id;
				if(!$scope.syncData.region){
					$scope.pop('请选择可用区域','error');
					return;
				}
				httpLoad.loadData({
					url:'/db/ins/sync',
					method:'POST',
					data: $scope.syncData,
					success:function(data){
						if(data.success){
							$scope.pop('数据库同步成功');
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel'); // 退出
			};
		}]);
})()


/**
 * Created by Zhang Haijun on 2016/10/14.
 */
(function(){
	"use strict";
	app.controller('DataBaseCloudCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$stateParams','$timeout','$state','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal, $stateParams, $timeout, $state, LANGUAGE) {
			$scope.param = {
				page: 1,
				rows: 10
			};
			$scope.platform = $stateParams.flag;
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
			};
			$scope.selectTab = function(){
				$scope.getList();
			};
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
				}
			}
			$scope.sync = function(){
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/assets/database/rds/syncModal.html',
					controller : 'SyncDataBaseModalCtrl',
				});
				modalInstance.result.then(function(){
					$scope.getList()
				});
			};
			$scope.create = function(){
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/assets/database/rds/cloudModal.html',
					controller : 'SelectCloudVendorModalCtrl',
				});
				modalInstance.result.then(function(data){
					$state.go('app.assets.addclouddb',{flag:data.flag,id:data.id});
				});
			};
		}
	]);
	app.controller('SelectCloudVendorModalCtrl',['$rootScope','$scope','$modalInstance','httpLoad',
		function($rootScope,$scope,$modalInstance,httpLoad){
			//获取云平台
			(function () {
				httpLoad.loadData({
					url:'/cloudVendor/list',
					method: 'POST',
					data: {
						simple:true,
						params:angular.toJson([{param:{type:'ALIYUN'},sign:'EQ'}])
					},
					noParam: true,
					success:function(data){
						if(data.success){
							if(data.data){
								$scope.cloudVendorData = data.data.rows;
								if($scope.cloudVendorData.length > 0){
									var item = $scope.cloudVendorData[0];
									item.isRegionActive = true;
									$scope.id = data.id;
								};
							}
						}
					}
				});
			})();
			//选择云供应商
			$scope.chooseCloud = function(item){
				if(item.isRegionActive) return;
				angular.forEach($scope.cloudVendorData, function(data,index){
					data.isRegionActive = false;
					if(data.id==item.id){
						data.isRegionActive = true;
						$scope.id = data.id;
					}
				});
			};
			$scope.ok = function(){
				$modalInstance.close({id:$scope.id,flag:1});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel'); // 退出
			};
		}]);
	app.controller('SyncDataBaseModalCtrl',['$rootScope','$scope','$modalInstance','httpLoad','$stateParams',
		function($rootScope,$scope,$modalInstance,httpLoad,$stateParams){
			$scope.syncData = {};
			//获取云平台
			(function () {
				httpLoad.loadData({
					url:'/cloudVendor/list',
					method: 'POST',
					data: {
						simple:true,
						params:angular.toJson([{param:{type:'ALIYUN'},sign:'EQ'}])
						
					},
					noParam: true,
					success:function(data){
						if(data.success){
							if(data.data){
								$scope.cloudVendorData = data.data.rows;
								if($scope.cloudVendorData.length > 0){
									var item = $scope.cloudVendorData[0];
									item.isRegionActive = true;
									$scope.syncData.id = item.id;
									getRegin(item.id);
								};
							}
						}
					}
				});
			})();
			//获取可用区域数据
			var getRegin = function(id){
				httpLoad.loadData({
					url:'/region/list',
					method: 'POST',
					data: {"id":id},
					success:function(data){
						if(data.success){
							$scope.regionData = data.data;
							if($scope.regionData.length > 0){
								var item = $scope.regionData[0];
								item.isRegionActive = true;
								$scope.syncData.region = item.id;
							};
						}
					}
				});
			};
			//选择可用区域
			$scope.chooseRegion = function(item){
				if(item.isRegionActive) return;
				angular.forEach($scope.regionData, function(data,index){
					data.isRegionActive = false;
					if(data.id==item.id){
						data.isRegionActive = true;
						$scope.syncData.region = data.id;
					};
				});
			};
			//选择云供应商
			$scope.chooseCloud = function(item){
				if(item.isRegionActive) return;
				angular.forEach($scope.cloudVendorData, function(data,index){
					data.isRegionActive = false;
					if(data.id==item.id){
						data.isRegionActive = true;
						$scope.syncData.id = data.id;
						getRegin(data.id);
					}
				});
			};
			$scope.ok = function(){
				httpLoad.loadData({
					url:'/db/ins/sync',
					method:'POST',
					data: $scope.syncData,
					success:function(data){
						if(data.success){
							$scope.pop('同步任务已经下发，正在执行……');
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


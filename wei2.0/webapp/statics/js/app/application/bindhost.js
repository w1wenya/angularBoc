/**
 * Created by Zhang Haijun on 2016/10/19.
 */
(function(){
	"use strict";
	app.controller('BindHostCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state', '$stateParams','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal, $state, $stateParams, LANGUAGE) {
			$rootScope.moduleTitle = '应用中心 > 资源分配';//定义当前页
			$scope.itemsByPage = 20;//定义每页的条数
			//加载服务器列表
			var loadData = function(){
				httpLoad.loadData({
					url:'/app/resources',
					method:'GET',
					data:{
						id:$stateParams.id
					},
					success:function(data){
						if(data.success){
							$scope.serverListData= data.data;
							$scope.total = data.data.length;
						}
					}
				});
			}
			loadData();
			//选择服务器
			$scope.selectServer = function(){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/application/manage/bindModal.html',
					controller: 'bindServerModalCtrl',
					backdrop: 'static',
					size:'lg'
				});
				modalInstance.result.then(function (data) {
					loadData();
				});
			};
			//编辑资源
			$scope.edit = function(item){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/application/manage/editBindModal.html',
					controller: 'editBindModalCtrl',
					backdrop: 'static',
					resolve: {
						ItemData: function() {
							return item;
						}
					}
				});
				modalInstance.result.then(function(data) {
					loadData();
				});
			}
			//删除绑定资源
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要删除分配资源吗？';
						},
						btnList: function () {
							return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/app/resource/remove',
						data: {
							id:$stateParams.id,
							relationId:id
						},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.APPLICATION.MANAGE.DEL_BIND_SUCCESS);
								loadData();
							}
						}
					});
				});
			};
			$scope.goBack = function(){
				$state.go('app.application.manage');
			}
		}
	]);
	//新增绑定
	app.controller('bindServerModalCtrl', ['$scope', 'httpLoad', '$modalInstance','$stateParams','LANGUAGE',
		function($scope, httpLoad, $modalInstance, $stateParams,LANGUAGE) {
			$scope.param = {
				page: 1,
				rows: 10,
				category:'APP',
				target:$stateParams.id
			}
			var selectList = [];
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				$scope.isSelectAll = false;
				//获取已选主机的IPlist
				var ipList = [];
				for(var a in selectList){
					ipList.push(selectList[a].ip);
				}
				httpLoad.loadData({
					url:'/res/list',
					method:'POST',
					noParam: true,
					data:$scope.param,
					success:function(data){
						if(data.success){
							$scope.listData = data.data.rows;
							//数据反显
							for(var i = 0; i < $scope.listData.length; i++){
								var item = $scope.listData[i];
								var flag = ipList.indexOf(item.ip);
								if(flag > -1) $scope.listData[i] = selectList[flag];
							};
							$scope.totalPage = data.data.total;
						}
					}
				});
			}
			$scope.getList();
			//对选择的数据进行操作
			var setSelectList = function(data){
				if(data.isSelected){
					selectList.push(data);
				}else{
					for(var j = 0; j < selectList.length; j++){
						var item = selectList[j];
						if(item.ip == data.ip) selectList.splice(j,1)
					}
				}
			}
			//全选
			$scope.selectAll = function(){
				for(var a in $scope.listData){
					var item = $scope.listData[a];
					if($scope.isSelectAll != item.isSelected){
						item.isSelected = $scope.isSelectAll;
						setSelectList(item);
					}else item.isSelected = $scope.isSelectAll;
				}
			};
			//选择一个
			$scope.selectItem = function ($event,row) {
				$event.stopPropagation();
				setSelectList(row);
			}
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
					managerIp:$scope.ip,
					platform:$scope.platform
				});
				var param2 = toObjFormat({
					id:$stateParams.id
				});
				if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
				// if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
				$scope.param = {
					page: 1,
					rows: 10,
					category:'APP',
					target:$stateParams.id,
					params: angular.toJson(params)
				}
				$scope.getList(1)
			}
			$scope.ok = function () {
				var resources = [];
				selectList.forEach(function (item) {
					resources.push({resId:item.id,shared:(item.shared||false),used:(item.used||false)})
				})
				httpLoad.loadData({
					url:'/app/allocate',
					data:{
						id:$stateParams.id,
						resources:resources
					},
					success: function(data){
						if(data.success){
							$scope.pop(LANGUAGE.APPLICATION.MANAGE.ADD_BIND_SUCCESS);
							$modalInstance.close(data);
						}
					}
				});
			}
			$scope.cancle = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	//编辑
	app.controller('editBindModalCtrl', ['$scope', '$modalInstance', 'httpLoad', '$stateParams', 'LANGUAGE','ItemData',
		function($scope, $modalInstance,  httpLoad, $stateParams, LANGUAGE, ItemData) {
		//防止变量污染
		 var str = angular.toJson(ItemData);
			$scope.itemData = angular.fromJson(str);
			//保存按钮
			$scope.ok = function(){
				httpLoad.loadData({
					url: '/app/resource/update',
					data: {
						appId:$stateParams.id,
						id:$scope.itemData.id,
						host:$scope.itemData.host,
						used:$scope.itemData.used,
						shared:$scope.itemData.shared
					},
					success: function(data){
						if(data.success){
							$scope.pop(LANGUAGE.APPLICATION.MANAGE.EDIT_BIND_SUCCESS);
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


/**
 * Created by Zhang Haijun on 2016/10/27.
 */
(function(){
	"use strict";
	app.controller('ProcessApplyCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE','CommonData',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE, CommonData) {
			$rootScope.moduleTitle = '流程中心 > 申请管理';//定义当前页
			$scope.statusData = CommonData.applyStatus;
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson([{param:{createrId:$rootScope.userData.id},sign:'EQ'}])
			};
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/apply/list',
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
					createrId:$rootScope.userData.id,
					status: $scope.status
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
				var obj = ['name','status','date'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			};
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你要确认该申请吗？';
						},
						btnList: function () {
							return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/apply/remove',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.PROCESS.APPLY.DEL_SUCCESS);
								$scope.getList();
							}
						}
					});
				});
			};
			//详情
			$scope.goDetail = function(id){
				$modal.open({
					templateUrl: '/statics/tpl/process/apply/detailModal.html',
					controller: 'applyDetailModalCtrl',
					backdrop: 'static',
					resolve:{
						id: function () {
							return id;
						}
					}
				});
			};
			//添加
			$scope.create = function(){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/process/apply/addModal.html',
					controller: 'addApplyModalCtrl',
					backdrop: 'static'
				});
				modalInstance.result.then(function(data) {
					$scope.getList();
				});
			}
		}
	]);
	//添加
	app.controller('addApplyModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'LANGUAGE',
		function($scope, $modalInstance,  httpLoad, LANGUAGE) {
			var editObj = ['name','commandId','handler','remark'];
			(function(){
				httpLoad.loadData({
					url: '/user/list',
					method:'POST',
					noParam: true,
					data: {
						simple:true
					},
					success: function(data){
						if(data.success){
							$scope.userData = data.data.rows;
						}
					}
				});
				httpLoad.loadData({
					url: '/command/list',
					method:'POST',
					noParam: true,
					data: {
						simple:true
					},
					success: function(data){
						if(data.success){
							$scope.commandData = data.data.rows;
						}
					}
				});
			})();
			//保存按钮
			$scope.ok = function(){
				var param = {};
				for(var a in editObj){
					var attr = editObj[a];
					param[attr] = $scope[attr];
				}
				httpLoad.loadData({
					url: '/apply/create',
					data: param,
					success: function(data){
						if(data.success){
							$scope.pop(LANGUAGE.PROCESS.APPLY.ADD_SUCCESS);
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
//详情
	app.controller('applyDetailModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
		function($scope, $modalInstance, httpLoad, id) {
			httpLoad.loadData({
				url:'/apply/detail',
				method:'GET',
				data:{
					id:id
				},
				success:function(data){
					if(data.success){
						$scope.detailData = data.data;
					}
				}
			});
			$scope.cancle = function() {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
})()


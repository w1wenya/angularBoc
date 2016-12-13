/**
 * Created by Zhang Haijun on 2016/10/27.
 */
(function(){
	"use strict";
	app.controller('PersonalApplyCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE','CommonData',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE, CommonData) {
			$rootScope.moduleTitle = '消息中心 > 审核记录';//定义当前页
			$scope.statusData = CommonData.applyStatus;
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson([{param:{handler:$rootScope.userData.id},sign:'EQ'}])
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
					handler:$rootScope.userData.id,
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
			$scope.approve = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确认要通过该申请吗？';
						},
						btnList: function () {
							return  [{name:'确定',type:'btn-primary'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/apply/approve',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.PROCESS.APPLY.APPROVE_SUCCESS);
								$scope.getList();
							}
						}
					});
				});
			};
			$scope.refuse = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/personal/apply/refuseModal.html',
					controller: 'applyRefuseModalCtrl',
					backdrop: 'static',
					resolve:{
						id:function(){
							return id;
						}
					}
				});
				modalInstance.result.then(function() {
					$scope.getList();
				});
			};
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确认要删除该申请吗？';
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
		}
	]);
	//拒绝
	app.controller('applyRefuseModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'LANGUAGE', 'id',
		function($scope, $modalInstance, httpLoad, LANGUAGE, id) {
			$scope.ok = function(){
				httpLoad.loadData({
					url: '/apply/refuse',
					data: {
						id:id,
						reason:$scope.reason
					},
					success: function(data){
						if(data.success){
							$scope.pop(LANGUAGE.PROCESS.APPLY.REFUSE_SUCCESS);
							$modalInstance.close();
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


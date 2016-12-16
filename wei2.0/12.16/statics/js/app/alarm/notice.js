/**
 * Created by Zhang Haijun on 2016/10/17.
 */
(function(){
	"use strict";
	app.controller('NoticeListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE','CommonData',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE, CommonData) {
			$rootScope.moduleTitle = '参数管理 > 通知策略';//定义当前页
			$rootScope.link = '/statics/css/alarm.css';//引入页面样式
			$scope.levelData = CommonData.alarmNoticeLevel;
			$scope.param = {
				page: 1,
				rows: 10
			}
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/notice/strategy/list',
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
					level: $scope.level
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
				var obj = ['name','level'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//添加\编辑
			$scope.create = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/alarm/notice/addModal.html',
					controller: 'addNoticeModalCtrl',
					backdrop: 'static',
					resolve: {
						id: function() {
							return id || '';
						}
					}
				});
				modalInstance.result.then(function(data) {
					$scope.getList();
				});
			}
			//删除策略
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
						url: '/notice/strategy/remove',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.ALARM.NOTICE.DEL_SUCCESS);
								$scope.getList();
							}
						}
					});
				});
			};
			//人员绑定
			$scope.bindPerson = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/alarm/notice/bindModal.html',
					controller: 'bindPersonModalCtrl',
					backdrop: 'static',
					resolve: {
						id: function() {
							return id;
						}
					}
				});
				// modalInstance.result.then(function(data) {
				// 	$scope.getList();
				// });
			}
			//详情
			$scope.goDetail = function(id){
			 $state.go('app.config.noticedetail',{id:id})
			}
		}
	]);
//添加\编辑
	app.controller('addNoticeModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id', 'LANGUAGE','CommonData',
		function($scope, $modalInstance,  httpLoad, id, LANGUAGE, CommonData) {
			$scope.modalName = '添加通知策略';
			$scope.modeData = CommonData.noticeWay;
			$scope.levelData = CommonData.alarmNoticeLevel;
			$scope.timeData = CommonData.noticeTime;
			$scope.delayData = CommonData.noticeDelay;
			var editObj = ['name','level','timeperiod','delay','mode','remark'];
			var url = '/notice/strategy/create';
			//如果为编辑，进行赋值
			if(id){
				url = '/notice/strategy/modify';
				$scope.modalName = '编辑通知策略';
				httpLoad.loadData({
					url: '/notice/strategy/detail',
					method: 'GET',
					data: {id: id},
					success: function(data){
						if(data.success){
							var data = data.data;
							for(var a in editObj){
								var attr = editObj[a];
								$scope[attr] = data[attr];
							};
						}
					}
				});
			}
			//保存按钮
			$scope.ok = function(){
				var param = {};
				for(var a in editObj){
					var attr = editObj[a];
					param[attr] = $scope[attr];
				}
				if(id) param.id = id;
				httpLoad.loadData({
					url: url,
					data: param,
					success: function(data){
						if(data.success){
							var popText = LANGUAGE.ALARM.NOTICE.ADD_SUCCESS;
							if(id) popText = LANGUAGE.ALARM.NOTICE.EDIT_SUCCESS;
							$scope.pop(popText);
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
//绑定人员
	app.controller('bindPersonModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id','LANGUAGE',
		function($scope, $modalInstance,  httpLoad, id, LANGUAGE) {
			$scope.selectNodes = [];
			(function(){
				//处理数据
				var formatData = function(){
					httpLoad.loadData({
						url:'/notice/strategy/users',
						method:'GET',
						data:{
							id:id
						},
						success:function(data){
							if(data.success){
								var users = data.data;
								for (var b = 0 ;b < $scope.freeNodes.length; b++) {
									if (users.indexOf($scope.freeNodes[b].id) > -1) {
										$scope.addNodes(b,$scope.freeNodes[b]);
										b--;
									}
								}
							}
						}
					});
				}
				//获取未选人员列表
				httpLoad.loadData({
					url:'/user/list',
					method:'POST',
					noParam: true,
					data:{
						simple:true
					},
					success:function(data){
						if(data.success){
							$scope.freeNodes = data.data.rows;
							formatData();
						}
					}
				});
			})();
			$scope.addNodes = function(key,data){
				$scope.selectNodes.push(data);
				$scope.freeNodes.splice(key,1);
			}
			$scope.removeNodes = function(key,data){
				$scope.freeNodes.push(data);
				$scope.selectNodes.splice(key,1);
			}
			//保存按钮
			$scope.ok = function(){
				var userList = [];
				for(var a in $scope.selectNodes){
					userList.push($scope.selectNodes[a].id)
				}
				httpLoad.loadData({
					url: '/notice/strategy/binds',
					data: {
						id:id,
						users:userList
					},
					success: function(data){
						if(data.success){
							$scope.pop(LANGUAGE.ALARM.NOTICE.BIND_SUCCESS);
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


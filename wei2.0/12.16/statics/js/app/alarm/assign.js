/**
 * Created by Zhang Haijun on 2016/10/17.
 */
(function(){
	"use strict";
	app.controller('AssignListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE) {
			$rootScope.moduleTitle = '参数管理 > 分派策略';//定义当前页
			$rootScope.link = '/statics/css/alarm.css';//引入页面样式
			$scope.param = {
				page: 1,
				rows: 10
			}
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/dispatch/strategy/list',
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
				if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
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
				var obj = ['name','date'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//添加\编辑
			$scope.create = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/alarm/assign/addModal.html',
					controller: 'addAssignModalCtrl',
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
			};
			//详情
			$scope.goDetail = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/alarm/assign/detailModal.html',
					controller: 'assignDetailModalCtrl',
					backdrop: 'static',
					resolve: {
						id: function() {
							return id;
						}
					}
				});
			}
			//删除告警策略
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你要确认该分派策略吗？';
						},
						btnList: function () {
							return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/dispatch/strategy/remove',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.ALARM.ASSIGN.DEL_SUCCESS);
								$scope.getList();
							}
						}
					});
				});
			};
		}
	]);
//添加\编辑
	app.controller('addAssignModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id', 'LANGUAGE','CommonData',
		function($scope, $modalInstance,  httpLoad, id, LANGUAGE, CommonData) {
			$scope.modalName = '添加分派策略';
			$scope.changeMuOption = function(item) {
				item.muSelectId = [];
				item.selectMuName = '';
				for (var record in item.userData) {
					if (item.userData[record].flag) {
						item.muSelectId.push({userId:item.userData[record].id});
						item.selectMuName += item.userData[record].name + ',';
					}
				}
				item.selectMuName = item.selectMuName.substr(0, item.selectMuName.length - 1) || '--请选择--';
			}
			$scope.userList = [];
			//获取用户数据
			httpLoad.loadData({
				url: '/user/list',
				noParam: true,
				data: {
					simple:true
				},
				success: function(data){
					if(data.success){
						$scope.userListData = angular.toJson(data.data.rows);
						if(!id) $scope.userList = [{userData:angular.fromJson($scope.userListData),muSelectId:[],delay:30}]
					}
				}
			});
			$scope.removeUser = function (row,item) {
				row.flag = false;
				$scope.changeMuOption(item);
			}
			$scope.addGroup = function(){
				//做验证-》只有上面用户组有用户下面才可以继续添加用户组
				for(var i in $scope.userList){
					if($scope.userList[i].muSelectId.length == 0) return $scope.pop('请给用户组【'+(i/1+1)+'】添加用户','error');
				}
				$scope.userList.push({userData:angular.fromJson($scope.userListData),muSelectId:[],delay:30});
			}
			$scope.removeGroup = function(key){
				if($scope.userList.length == 1) return $scope.pop('请至少添加一组分派策略','error');
				$scope.userList.splice(key,1);
			}
			var url = '/dispatch/strategy/create';
			//如果为编辑，进行赋值
			if(id){
				url = '/dispatch/strategy/modify';
				$scope.modalName = '编辑分派策略';
				httpLoad.loadData({
					url: '/dispatch/strategy/detail',
					method: 'GET',
					data: {id: id},
					success: function(data){
						if (data.success) {
							var data = data.data;
							$scope.name = data.name;
							for(var i = 0; i < data.groups.length; i++){
								var item = data.groups[i];
								//组合userId
								var user = [];
								for(var a in item.users){
									user.push(item.users[a].userId);
								}
								var userData = angular.fromJson($scope.userListData);
								for (var j = 0; j < userData.length; j++) {
									if (user.indexOf(userData[j].id) > -1) userData[j].flag = true;
								}
								$scope.userList.push({userData: userData, muSelectId: [], delay: item.delay});
							}
							for(var c in $scope.userList){
								$scope.changeMuOption($scope.userList[c]);
							}
							
						}
					}
				});
			}
			//保存按钮
			$scope.ok = function(){
				//组合用户数据以及非空验证
				var user = [];
				for(var i in $scope.userList){
					var data = $scope.userList[i];
					if(data.muSelectId.length == 0) return $scope.pop('请给用户组【'+(i/1+1)+'】添加用户','error');
					var obj = {delay:data.delay,users:data.muSelectId}
					user.push(obj)
				}
				var param = {name:$scope.name,groups:user};
				if(id) param.id = id;
				httpLoad.loadData({
					url: url,
					data: param,
					success: function(data){
						if(data.success){
							var popText = LANGUAGE.ALARM.ASSIGN.ADD_SUCCESS;
							if(id) popText = LANGUAGE.ALARM.ASSIGN.EDIT_SUCCESS;
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
	//详情
	app.controller('assignDetailModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id', 'LANGUAGE','CommonData',
		function($scope, $modalInstance,  httpLoad, id, LANGUAGE, CommonData) {
			$scope.modalName = '分派策略详情';
			$scope.userList = [];
			httpLoad.loadData({
					url: '/dispatch/strategy/detail',
					method: 'GET',
					data: {id: id},
					success: function(data){
						if (data.success) {
							var data = data.data;
							$scope.name = data.name;
							for(var i = 0; i < data.groups.length; i++){
								var item = data.groups[i];
								$scope.userList.push({userData: item.users, delay: item.delay});
							}
						}
					}
				});
			$scope.cancle = function() {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
})()


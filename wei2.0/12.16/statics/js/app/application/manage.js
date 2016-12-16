/**
 * Created by Zhang Haijun on 2016/6/16.
 */
(function(){
	"use strict";
	app.controller('ApplicationManageListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE) {
			$rootScope.moduleTitle = '应用中心 > 应用管理';//定义当前页
			$scope.param = {
				page: 1,
				rows: 10,
			}
			$scope.getList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/app/list',
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
					createrId: $scope.createrId || $scope.creator,
					menderId: $scope.menderId || $scope.mender
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
				var obj = ['name','creator','date','mender'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//添加\编辑应用
			$scope.createApp = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/application/manage/addModal.html',
					controller: 'addAppModalCtrl',
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
			//删除应用
			$scope.remove = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要删除该应用吗？';
						},
						btnList: function () {
							return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function() {
					httpLoad.loadData({
						url: '/app/remove',
						data: {id:id},
						success: function(data){
							if(data.success){
								$scope.pop(LANGUAGE.APPLICATION.MANAGE.DEL_SUCCESS);
								$scope.getList();
							}
						}
					});
				});
			};
			//资源绑定
			$scope.bindHost = function(id){
				$state.go('app.application.bindhost',{id:id})
			}
			//详情
			$scope.goDetail = function(id){
			 $state.go('app.application.appdetail',{id:id})
			}
			//绑定告警策略
			$scope.bindAlarm = function(row){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/application/manage/alarmModal.html',
					controller: 'bindAlarmModalCtrl',
					backdrop: 'static',
					size:'sm',
					resolve: {
						id: function() {
							return row.id;
						},
						asId:function() {
							return row.asId;
						}
					}
				});
				modalInstance.result.then(function(data) {
					$scope.getList();
				});
			}
			//绑定分派
			$scope.bindAssign = function(row){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/application/manage/assignModal.html',
					controller: 'bindAssignModalCtrl',
					backdrop: 'static',
					size:'sm',
					resolve: {
						id: function() {
							return row.id;
						},
						dsId:function() {
							return row.dsId;
						}
					}
				});
				modalInstance.result.then(function(data) {
					$scope.getList();
				});
			};
			//生效
			$scope.upload = function (row) {
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/application/manage/activeModal.html',
					controller: 'activeAlarmModalCtrl',
					backdrop: 'static',
					size:'sm',
					resolve: {
						id: function() {
							return row.id;
						},
						asId:function() {
							return row.asId;
						}
					}
				});
				modalInstance.result.then(function(data) {
					row.isUpload = true;
				});
			}
		}
	]);
//添加\编辑应用ctrl
	app.controller('addAppModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id', 'LANGUAGE','CommonData',
		function($scope, $modalInstance,  httpLoad, id, LANGUAGE, CommonData) {
			$scope.modalName = '添加应用';
			$scope.appTypeData = CommonData.appType;
			var editObj = ['name','uuid','type','version','name','remark','domain','path','toolId','ciJob','fullpath'];
			var url = '/app/create';
			var getDepartment = function(){
				//获取组织机构数据
				httpLoad.loadData({
					url: '/department/list',
					method: 'POST',
					data: {'parentId':0},
					noParam:true,
					success: function(data){
						if(data.success){
							$scope.treeData = data.data;
						}
					}
				});
			};
			//获取集成工具列表
			(function(){
				httpLoad.loadData({
					url: '/ci/tool/list',
					noParam: true,
					data: {
						simple:true
					},
					success: function(data){
						if(data.success){
							$scope.toolData = data.data.rows;
						}
					}
				});
			})();
			//获取集成任务
			$scope.getCiJob = function () {
				if(!$scope.toolId) return;
				var param = [{ param:{toolId:$scope.toolId},sign:'EQ'}];
				httpLoad.loadData({
					url: '/ci/job/list',
					noParam: true,
					data: {
						simple:true,
						params : JSON.stringify(param)
					},
					success: function(data){
						if(data.success){
							$scope.ciJobData = data.data.rows;
						}
					}
				})
			}
			//如果为编辑，进行赋值
			if(id){
				url = '/app/modify';
				$scope.modalName = '编辑应用';
				httpLoad.loadData({
					url: '/app/basic',
					method: 'GET',
					data: {id: id},
					success: function(data){
						if(data.success){
							var data = data.data;
							for(var a in editObj){
								var attr = editObj[a];
								$scope[attr] = data[attr]||'';
							};
							$scope.getCiJob();
							$scope.groupId = data.deptId;$scope.groupName = data.deptName;
							getDepartment()
						}
					}
				});
			}else getDepartment();
			//保存按钮
			$scope.ok = function(){
				var param = {};
				for(var a in editObj){
					var attr = editObj[a];
					param[attr] = $scope[attr];
				}
				param.deptId = $("#mycombotree").combotree("getValues")[0];
				if(id) param.id = id;
				httpLoad.loadData({
					url: url,
					data: param,
					success: function(data){
						if(data.success){
							var popText = LANGUAGE.APPLICATION.MANAGE.ADD_SUCCESS;
							if(id) popText = LANGUAGE.APPLICATION.MANAGE.EDIT_SUCCESS;
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
	//绑定告警ctrl
	app.controller('bindAlarmModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id', 'asId',
		function($scope, $modalInstance,  httpLoad, id, asId) {
		$scope.asId = asId||'';
			(function(){
				httpLoad.loadData({
					url:'/alarm/strategy/list',
					method:'POST',
					noParam: true,
					data:{
						simple:true
					},
					success:function(data){
						if(data.success){
							$scope.listData = data.data.rows;
						}
					}
				});
			})();
			//保存按钮
			$scope.ok = function(){
				httpLoad.loadData({
					url: '/app/bindAlarm',
					data: {
						id:id,
						asId:$scope.asId
					},
					success: function(data){
						if(data.success){
							$scope.pop('告警策略绑定成功');
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
	//绑定分派ctrl
	app.controller('bindAssignModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id', 'dsId',
		function($scope, $modalInstance,  httpLoad, id, dsId) {
			$scope.dsId = dsId||'';
			(function(){
				httpLoad.loadData({
					url:'/dispatch/strategy/list',
					method:'POST',
					noParam: true,
					data:{
						simple:true
					},
					success:function(data){
						if(data.success){
							$scope.listData = data.data.rows;
						}
					}
				});
			})();
			//保存按钮
			$scope.ok = function(){
				httpLoad.loadData({
					url: '/app/bindDispatch',
					data: {
						id:id,
						dsId:$scope.dsId
					},
					success: function(data){
						if(data.success){
							$scope.pop('分派策略绑定成功');
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
	//分派
	app.controller('activeAlarmModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id','asId',
		function($scope, $modalInstance,  httpLoad, id, asId) {
			(function(){
				httpLoad.loadData({
					url:'/ident/list',
					noParam:true,
					data:{
						simple:true
					},
					success:function(data){
						if(data.success){
							$scope.accountData = data.data.rows;
							for(var a in $scope.accountData){
								var data = $scope.accountData[a];
								data.name = data.username;
								if(data.remark){
									data.name = data.username + '(' + data.remark + ')';
								}
							}
						}
					}
				});
			})();
			//保存按钮
			$scope.ok = function(){
				httpLoad.loadData({
					url:'/alarm/strategy/upload',
					method:'POST',
					data:{
						id:asId,
						appId:id,
						identId:$scope.identId
					},
					success:function(data){
						if(data.success){
							$scope.pop('策略已生效');
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
	//下拉树
	app.directive('ngAppCombotree',
		[ function () {
			return {
				restrict: 'AE',
				scope: {
					treeData: '=',
					groupId: '=',
					groupName: '='
				},
				link: function (scope, element, attrs) {
					scope.$watch('treeData', function (newValue, oldValue) {
						element.combotree({
							data: scope.treeData,
							textField: "text",
							valueField: "id",
							emptyText: '请选择',
							onBeforeExpand: function (row, param) {
								$('#mycombotree').combotree('tree').tree('options').url = '/department/list?parentId=' + row.id;
							},
							onSelect: function (row) {
								scope.groupId = row.id;
							},
							onLoadSuccess: function (node, data) {
								if (scope.groupId) {
									defaultValue('mycombotree', scope.groupId, scope.groupName);
								}
								//deftext：生成节点的文本用于显示
								function defaultValue(cbtid, defVal, defText) {
									var combotree = $("#" + cbtid);
									var tree = combotree.combotree('tree');
									var defNode = tree.tree("find", defVal);
									if (!defNode) {
										tree.tree('append', {
											data: [{
												id: defVal,
												name: defText,
												parentId: 0,
												children: "",
												checked: false
											}]
										});
										defNode = tree.tree("find", defVal);
										combotree.combotree('setValue', defVal);
										tree.tree('select', defNode.target);
										defNode.target.style.display = 'none';
									} else {
										combotree.combotree('setValue', defVal);
									}
								}
							},
							loadFilter: function (rows, parent) {
								if (rows.success) rows = rows.data;
								var nodes = [];
								// get the top level nodes
								for (var i = 0; i < rows.length; i++) {
									var row = rows[i];
									var state = 'open';
									//if (!exists(rows, row.parentId)){
									if (row.children) {
										state = 'closed';
										if (row.children == "[]") row.children = [];
									} else state = 'open';
									//}
									nodes.push({
										id: row.id,
										text: row.name,
										parentId: row.parentId,
										children: row.children,
										checked: row.checked,
										state: state
									});
								}
								return nodes;
							}
						});
					});
				}
			};
		}]);
})()


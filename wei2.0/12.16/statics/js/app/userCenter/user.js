(function(){
	"use strict";
	app.controller('userCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal,$state, $timeout,LANGUAGE) {
			$rootScope.moduleTitle = '系统管理 > 用户管理';//定义当前页
			$rootScope.link = '/statics/css/user.css';//引入页面样式
			$scope.param = {
				rows: 10
			};
			$scope.isbatchDelete = true;
			//获取用户列表
			$scope.getData = function(page){
				$scope.param.page = page || $scope.param.page;
				var params = {
					 page: $scope.param.page,
					 rows: $scope.param.rows
				},
				searchParam = [];
				if($scope.searchByUsername&&$scope.searchByUsername!=""){
					searchParam.push({"param":{"username":$scope.searchByUsername},"sign":"LK"});
				}
				if($scope.searchByName&&$scope.searchByName!=""){
					if(searchParam.length==0) searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
					else {
						var a = 0;
						for(var i=0;i<searchParam.length;i++){
							if(searchParam[i].sign=="LK") {
								a = 1;
								searchParam[i].param.name = $scope.searchByName;
							}
						}
						if(a==0) searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
					}
				}
				if($scope.searchByPhone&&$scope.searchByPhone!=""){
					if(searchParam.length==0) searchParam.push({"param":{"phone":$scope.searchByPhone},"sign":"LK"});
					else {
						var a = 0;
						for(var i=0;i<searchParam.length;i++){
							if(searchParam[i].sign=="LK") {
								a = 1;
								searchParam[i].param.phone = $scope.searchByPhone;
							}
						}
						if(a==0) searchParam.push({"param":{"phone":$scope.searchByPhone},"sign":"LK"});
					}
				}
				if($scope.searchByMobile&&$scope.searchByMobile!=""){
					if(searchParam.length==0) searchParam.push({"param":{"mobile":$scope.searchByMobile},"sign":"LK"});
					else {
						var a = 0;
						for(var i=0;i<searchParam.length;i++){
							if(searchParam[i].sign=="LK") {
								a = 1;
								searchParam[i].param.mobile = $scope.searchByMobile;
							}
						}
						if(a==0) searchParam.push({"param":{"mobile":$scope.searchByMobile},"sign":"LK"});
					}
				}
				if($scope.searchByState&&$scope.searchByState!=""){
					searchParam.push({"param":{"status":$scope.searchByState},"sign":"EQ"});
				}
				params.params = JSON.stringify(searchParam);
				httpLoad.loadData({
					url:'/user/list',
					method: 'POST',
					data: params,
					noParam: true,
					success:function(data){
						if(data.success&&data.data.rows&&data.data.rows.length!=0){
							$scope.userList = data.data.rows;
							$scope.totalCount = data.data.total;
							$scope.isImageData = false;
							angular.forEach($scope.userList, function(data,index){
								if(data.isLocked){
									data.isfreeze=false;
									data.isthaw=true;
								}else{
									data.isfreeze=true;
									data.isthaw=false;
								}
					        });
						}else{
							$scope.isImageData = true;
						}						
					}
				});
			};
			$scope.getData(1);

			//获取组织机构数据
			httpLoad.loadData({
				url: '/department/list',
				method: 'POST',
				data: {'parentId':0},
				noParam:true,
				success: function(data){
					if(data.success && data.data && data.data.length!=0){
						$scope.treeData = data.data;
					}
				}
			});
			//返回
			$scope.goBack = function(){
				$scope.isActive = false;
				$timeout(function() {
					$scope.showDetail = false;
				}, 200);
			};
			//跳转详情页
			$scope.detail = function(id){
				$state.go('app.userCenter.userDetail',{id:id});
			};
			//资源绑定
			$scope.bindHost = function(id){
				$state.go('app.userCenter.userResource',{id:id})
			};
			//授权
			$scope.grant = function($event,$index,id,key,size){
				$event.stopPropagation();
				$scope.permissionList = {"id":id};
				$scope.nodeId = [];
				httpLoad.loadData({
					url:'/user/roles',
					method:'POST',
					data: $scope.permissionList,
					success:function(data){
						$scope.roledata = data.data;
						var modalInstance = $modal.open({
							templateUrl : '/statics/tpl/userCenter/user/grant.html',  //指向上面创建的视图
							controller : 'grantUserModalCtrl',// 初始化模态范围
							size : size,
							resolve : {
								permissionList : function(){
									return $scope.permissionList;
								},
								roledata : function(){
									return $scope.roledata;
								},
								id : function(){
									return id;
								}
							}
						});
					}
				});
			};
			//重置密码
			$scope.reset = function($event,$index,id,key){
				$event.stopPropagation();
				httpLoad.loadData({
					url:'/user/reset',
					method:'POST',
					data:{id: id},
					success:function(data){
						if(data.success){
							$scope.pop(LANGUAGE.OPERATION.USER.RESET);
						}
					}
				});
			};
			//新增
			$scope.add = function($event,size){
				$scope.treeData = $scope.treeData||"";
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/userCenter/user/add.html',
					controller : 'addUserModalCtrl',
					size : size,
					resolve : {
						treeData: function(){
							return $scope.treeData;
						},
						userList : function(){
							return $scope.userList;
						}
					}
				});
				modalInstance.result.then(function(result){
					$scope.getData();
				},function(){});
			};
			//编辑
			$scope.update = function($event,$index,row,key,size){
				$event.stopPropagation();
				$scope.treeData = $scope.treeData||"";
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/userCenter/user/update.html',
					controller : 'updateUserModalCtrl',
					size : size,
					resolve : {
						id : function(){
							return row.id;
						},
						updateData : function(){
							return $scope.userList[$index];
						},
						treeData: function(){
							return $scope.treeData;
						}
					}
				});
				modalInstance.result.then(function(){
					$scope.getData();
				},function(){});
			};
			//删除
			$scope.remove = function(id,$event,$index,key){
				if($event) $event.stopPropagation();
				$scope.removeData= {"id" : id};
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/userCenter/user/remove.html',
					controller : 'removeUserModalCtrl',
					resolve : {
						index : function(){
							return $index;
						},
						removeData : function(){
							return $scope.removeData;
						},
						userList : function(){
							return $scope.userList;
						}
					}
				});
				modalInstance.result.then(function(){
					$scope.getData();
					$scope.isCheck = false;
				},function(){});
			};
			//冻结
			$scope.freeze = function($event,id){
				$event.stopPropagation();
				$scope.freezeData= {"id" : id};
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/userCenter/user/freeze.html',
					controller : 'freezeUserModalCtrl',
					resolve : {
						freezeData : function(){
							return $scope.freezeData;
						}
					}
				});
				modalInstance.result.then(function(){
					$scope.getData();
				},function(){});
			};
			//解冻
			$scope.thaw = function($event,id){
				$event.stopPropagation();
				$scope.thawData= {"id" : id};
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/userCenter/user/thaw.html',
					controller : 'thawUserModalCtrl',
					resolve : {
						thawData : function(){
							return $scope.thawData;
						}
					}
				});
				modalInstance.result.then(function(){
					$scope.getData();
				},function(){});
			};
			//配额
			$scope.size = function(item){  //打开模态
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/userCenter/user/size.html',  //指向上面创建的视图
					controller : 'sizeuserModalCtrl',// 初始化模态范围
					resolve : {
						item: function() {
							return item;
						}
					}
				});
				modalInstance.result.then(function(){
					$scope.getData();
				},function(){});
			};
		}
	]);

	//授权ctrl
	angular.module('app').controller('grantUserModalCtrl',['$scope','$modalInstance','httpLoad','permissionList','roledata','id','LANGUAGE',
		function($scope,$modalInstance,httpLoad,permissionList,roledata,id,LANGUAGE){ //依赖于modalInstance
			$scope.permissionList = permissionList;
			$scope.roledata = roledata;
			$scope.ok = function(){
				var nodeId = '';
				angular.forEach($scope.roledata, function(data,index){
					if(data.checked){
						nodeId += ','+ data.id;
					}
				});
				nodeId = nodeId.substr(1);
				$scope.grantData ={id:id,roles:nodeId};
				httpLoad.loadData({
					url: '/user/accredit',
					method: 'POST',
					data: $scope.grantData,
					success:function(data){
						if(data.success){
							//console.log($scope.grantData);
							$scope.pop(LANGUAGE.OPERATION.USER.GRANT_SUCCESS);
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel'); // 退出
			}
		}]);
	//新增ctrl
	angular.module('app').controller('addUserModalCtrl',['$scope','$modalInstance','httpLoad','userList','LANGUAGE','treeData',
		function($scope,$modalInstance,httpLoad,userList,LANGUAGE,treeData){ //依赖于modalInstance
			$scope.isSame=false;
			$scope.index = 2;var aa=JSON.stringify(treeData);$scope.treeData=JSON.parse(aa);
			$scope.addData={};
			$scope.addData.loginStatus=0;
			if($scope.confirmPassword!=$scope.addData.password){
				$scope.isSame=true;
				$scope.addUserForm.$invalid=false;
			}else{
				$scope.isSame=false;
			}
			//check 用户名
			$scope.checkusername = function(){
				if(!$scope.addData.username) return;
				if($scope.addData.username=="") return;
				httpLoad.loadData({
					url:'/user/checkUsername',
					method:'POST',
					data: {"username":$scope.addData.username},
					success:function(data){
						if(data.success){
							$scope.addUserForm.$invalid = false;
						}else{
							//$scope.pop(data.message,'error');
							$scope.addUserForm.$invalid = true;
							$scope.addData.username = "";
						}
					}
				});
			};

			$scope.ok = function(){
				var sValues = $("#mycombotree2").combotree("getValues");
				$scope.addData.departId = sValues[0];
				if($scope.addData.departId==""){
					$scope.pop("请选择组织机构",'error');
					return;
				}
				httpLoad.loadData({
					url:'/user/create',
					method:'POST',
					data: $scope.addData,
					success:function(data){
						if(data.success&&data.data){
							//console.log($scope.addData);
							//console.log(JSON.stringify($scope.addData));
							var id = data.data["id"];
							$scope.pop(LANGUAGE.OPERATION.USER.ADD_SUCCESS);
							$modalInstance.close(id);
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel'); // 退出
			}
		}]);
	//编辑ctrl
	angular.module('app').controller('updateUserModalCtrl',['$scope','$modalInstance','httpLoad','updateData','LANGUAGE','treeData',
		function($scope,$modalInstance,httpLoad,updateData,LANGUAGE,treeData){ //依赖于modalInstance
			$scope.index = 1;var bb=JSON.stringify(treeData);$scope.treeData=JSON.parse(bb);

			var aa=JSON.stringify(updateData);
			$scope.updateData=JSON.parse(aa);

			$scope.groupId = $scope.updateData.departId;$scope.groupName = $scope.updateData.departName;
			$scope.ok = function(){
				var sValues = $("#mycombotree1").combotree("getValues");
				$scope.updateData.departId = sValues[0];
				httpLoad.loadData({
					url:'/user/modify',
					method:'POST',
					data: $scope.updateData,
					success:function(data){
						if(data.success){
							//console.log($scope.updateData);
							$scope.pop(LANGUAGE.OPERATION.USER.EDIT_SUCCESS);
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel'); // 退出
			}
		}]);
	//删除ctrl
	angular.module('app').controller('removeUserModalCtrl',['$scope','$modalInstance','httpLoad','removeData','userList','index','LANGUAGE',
		function($scope,$modalInstance,httpLoad,removeData,userList,index,LANGUAGE){ //依赖于modalInstance
			$scope.content = '是否删除用户？';
			$scope.ok = function(){
				httpLoad.loadData({
					url:'/user/remove',
					method:'POST',
					data: removeData,
					success:function(data){
						if(data.success){
							//console.log(removeData);
							$scope.pop(LANGUAGE.OPERATION.USER.DEL_SUCCESS);
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel'); // 退出
			}
		}]);
	//冻结ctrl
	angular.module('app').controller('freezeUserModalCtrl',['$scope','$modalInstance','httpLoad','freezeData','LANGUAGE',
		function($scope,$modalInstance,httpLoad,freezeData,LANGUAGE){ //依赖于modalInstance
			$scope.ok = function(){
				httpLoad.loadData({
					url:'/user/lock',
					method:'POST',
					data: freezeData,
					success:function(data){
						if(data.success){
							//console.log(freezeData);
							$scope.pop(LANGUAGE.OPERATION.USER.FREEZE_SUCCESS);
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel'); // 退出
			}
	}]);
	//解冻ctrl
	angular.module('app').controller('thawUserModalCtrl',['$scope','$modalInstance','httpLoad','thawData','LANGUAGE',
		function($scope,$modalInstance,httpLoad,thawData,LANGUAGE){ //依赖于modalInstance
			$scope.ok = function(){
				httpLoad.loadData({
					url:'/user/active',
					method:'POST',
					data: thawData,
					success:function(data){
						if(data.success){
							//console.log(thawData);
							$scope.pop(LANGUAGE.OPERATION.USER.THAW_SUCCESS);
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel'); // 退出
			}
		}]);
	//配额ctrl
	angular.module('app').controller('sizeuserModalCtrl',['$scope','$modalInstance','item','LANGUAGE','httpLoad',
		function($scope,$modalInstance,item,LANGUAGE,httpLoad){ //依赖于modalInstance
			$scope.sizeData = {
				"id":item.id,
				"cpu":item.cpu,
				"memory":item.memory,
				"disk":item.disk
			};

			$scope.ok = function(){
				httpLoad.loadData({
					url:'/user/quota',
					method:'POST',
					data: $scope.sizeData,
					success:function(data){
						if(data.success){
							$scope.pop(LANGUAGE.OPERATION.USER.SIZE_SUCCESS);
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel'); // 退出
			};
		}]);


	angular.module('app').directive('userCombotree',
		['$rootScope', '$timeout', 'httpLoad', function ($rootScope,$timeout,httpLoad) {
			return {
				restrict: 'AE',
				scope : {
					treeData        : '=',
					groupId          : '=',
					groupName         :'=',
					index              : '='
				},
				link: function (scope, element, attrs) {
					scope.$watch('treeData',function(newValue,oldValue){
						element.combotree({
							data: scope.treeData,
							textField :"text",
							valueField : "id",
							emptyText : '请选择',
							onBeforeExpand: function(row,param){
								$('#mycombotree'+scope.index).combotree('tree').tree('options').url = '/department/list?parentId='+row.id;
							},
							onSelect:function(row) {
								scope.groupId = row.id;
								//httpLoad.loadData({
								//	url:'/department/detail',
								//	method:'GET',
								//	data: {id: row.id},
								//	success:function(data){
								//		if(data.success){
								//			scope.path = data.data.path;
								//		}
								//	}
								//});
							},
							onLoadSuccess :function(node, data){
								if(scope.groupId){
									/*for(var a in data){
									 if(data[a].id==scope.groupId){
									 scope.groupName = data[a].text;
									 }
									 }*/
									defaultValue('mycombotree1',scope.groupId,scope.groupName);
									/*$('#mycombotree').combotree('setValue',{
									 id: scope.groupId,
									 text: scope.groupName
									 });*/
								}
								//deftext：生成节点的文本用于显示
								function defaultValue(cbtid,defVal,defText){
									var combotree =$("#"+cbtid);
									var tree = combotree.combotree('tree');
									var defNode = tree.tree("find",defVal);
									if(!defNode){
										tree.tree('append', {
											data: [{
												id: defVal,
												name: defText,
												parentId:0,
												children:"",
												checked:false
											}]
										});
										defNode = tree.tree("find",defVal);
										combotree.combotree('setValue',defVal);
										tree.tree('select',defNode.target);
										defNode.target.style.display='none';
									}else{
										combotree.combotree('setValue',defVal);
									}
								}
							},
							loadFilter: function(rows,parent){
								if(rows.success) rows = rows.data;
								var nodes = [];
								// get the top level nodes
								for(var i=0; i<rows.length; i++){
									var row = rows[i];
									var state = 'open';
									//if (!exists(rows, row.parentId)){
									if(row.children){
										state = 'closed';
										if(row.children=="[]") row.children=[];
									} else state = 'open';
									//}
									nodes.push({
										id:row.id,
										text:row.name,
										parentId:row.parentId,
										children:row.children,
										checked:row.checked,
										state:state
									});
								}
								return nodes;
							}
						});
					});
				}
			};
		}]);
})();
/**
 * Created by Zhang Haijun on 2016/6/15.
 */
(function(){
	"use strict";
	app.controller('ScriptManageCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout',
		function($scope, httpLoad, $rootScope, $modal, $timeout) {
			$rootScope.moduleTitle = '配置中心 > 脚本管理';//定义当前页
			$rootScope.link = '/statics/css/managescript.css';
			//获取脚本列表数据
			$scope.param = {
				page: 1,
				rows: 10
			};
			$scope.index = 0;

			$scope.getScriptList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/script/list',
					method:'POST',
					noParam:true,
					data:$scope.param,
					success:function(data){
						if(data.success&&data.data.rows&&data.data.rows.length!=0){
							$scope.scriptListData = data.data.rows;
							$scope.totalPage = data.data.total;
							$scope.isImageData = false;
						}else{
							$scope.isImageData = true;
						}
					}
				})
			};
			$scope.getScriptList();
			//对参数进行处理，去除空参数
			var toObjFormat = function(obj) {
				for (var a in obj) {
					if (obj[a] == "") delete obj[a];
				}
				return obj;
			};
			//搜索
			$scope.search = function(){
				var sValues = $("#mycombotree0").combotree("getValues");
				//对时间进行处理
				var toFormatTime = function(time, place) {
					if (!time) return "";
					var date = time.split(' - ');
					return date[place/1];
				};
				var params = [];
				var param1 = toObjFormat({
					name:$scope.name
				});
				var param2 = toObjFormat({
					groupId:sValues[0]
				});
				if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
				if (param2.groupId != ""&&param2.groupId) params.push({param: param2, sign: 'EQ'});
				if ($scope.date) {
					params.push({param: {gmtCreate: toFormatTime($scope.date, 0)}, sign: 'GET'});
					params.push({param: {gmtCreate: toFormatTime($scope.date, 1)}, sign: 'LET'});
				}
				$scope.param = {
					page: 1,
					rows: 10,
					params: angular.toJson(params)
				};
				$scope.getScriptList();
			};
			//重置搜索条件
			$scope.reset = function(){
				var obj = ['name','date'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				});
				$('#mycombotree0').combotree("clear");
			};
			// //自动填充创建人
			// $scope.autoComplete = function(){
			// 	$scope.creater = $rootScope.userData.username
			// }
			//获取脚本分组数据
			httpLoad.loadData({
				url: '/script/group/list',
				method: 'POST',
				data: {'parentId':0},
				noParam:true,
				success: function(data){
					if(data.success && data.data && data.data.length!=0){
						$scope.treeData = data.data;
					}
				}
			});
			//添加
			$scope.addScript = function(){
				$scope.treeData = $scope.treeData||"";
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/config/managescript/addScriptModal.html',
					controller: 'addScriptModalCtrl',
					backdrop: 'static',
					keyboard:false,
					size:'lg',
					resolve: {
						treeData: function(){
							return $scope.treeData;
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.getScriptList();
				});
			};
			//编辑
			$scope.editScript = function(row){
				$scope.treeData = $scope.treeData||"";
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/config/managescript/editScriptModal.html',
					controller: 'editScriptModalCtrl',
					backdrop: 'static',
					size:'lg',
					keyboard:false,
					resolve: {
						item: function () {
							return row;
						},
						treeData: function(){
							return $scope.treeData;
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.groupId="";
					$scope.getScriptList();
				});
			};
			//详情
			$scope.goDetail = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/config/managescript/detailModal.html',
					controller: 'detailScriptModalCtrl',
					backdrop: 'static',
					size:'lg',
					keyboard:false,
					resolve: {
						id: function () {
							return id;
						}
					}
				});
			};
			//删除
			$scope.delScript = function(id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/config/managescript/delScriptModal.html',
					controller: 'delScriptModalCtrl',
					backdrop: 'static',
					resolve: {
						id: function () {
							return id;
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.getScriptList();
				});
			}
		}
	]);
	//添加ctrl
	app.controller('addScriptModalCtrl', ['$scope', '$modalInstance', 'httpLoad', '$timeout','treeData',
		function ($scope, $modalInstance, httpLoad, $timeout,treeData) {
			$scope.index = 2;
			var aa=JSON.stringify(treeData);
			$scope.treeData=JSON.parse(aa);
			//获取脚本列表数据
			httpLoad.loadData({
				url:'/script/list',
				data:{
					page:1,
					rows:10,
					simple:true
				},
				noParam:true,
				method:'POST',
				success:function(data){
					if(data.success){
						$scope.scriptListData = data.data.rows;
					}
				}
			});
			//选择脚本来源
			$scope.source = 1;$scope.scriptType = "SHELL";
			$scope.selectSource = function () {
				$scope.source == 1 ? $scope.codeMirror.options.readOnly = false : $scope.codeMirror.options.readOnly = true;
			};
			//获取脚本内容
			$scope.scriptItem = {};
			$scope.getScriptValue = function(){
				httpLoad.loadData({
					url:'/script/detail',
					method:'GET',
					data:{
						id:$scope.scriptItem.selected.id
					},
					success:function(data){
						if(data.success){
							$scope.codeMirror.setValue(data.data.content);
						}
					}
				});
			};
			$timeout(function(){
				//选择本地脚本
				$('.file').on('change',function(){
					var data = $(this)[0].files[0];
					if (data) {
						//将文件进行转码，转换为text
						var reader = new FileReader();
						reader.readAsText(data);
						reader.onload = function (f) {
							$scope.codeMirror.setValue(this.result);
						}
					}
				});
			},100);
			$scope.ok = function () {
				var sValues = $("#mycombotree2").combotree("getValues");
				var param = {
					name: $scope.name,
					content: $scope.codeMirror.getValue(),
					type: $scope.scriptType,
					groupId: sValues[0]
				};
				if(!param.groupId){
					$scope.pop('请选择脚本分组','error');
					return;
				}else  if(!param.content){
					$scope.pop('请输入脚本内容','error');
					return;
				}
				httpLoad.loadData({
					url: '/script/create',
					method: 'POST',
					data: param,
					success: function (data) {
						if(data.success){
							$scope.pop('脚本添加成功');
							$modalInstance.close($scope.name);
						}
					}
				});
			}
			$scope.cancle = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	//编辑ctrl
	app.controller('editScriptModalCtrl', ['$scope', '$modalInstance', 'httpLoad', '$timeout','item','treeData',
		function ($scope, $modalInstance, httpLoad, $timeout, item,treeData) {
			$scope.name = item.name;$scope.source = 1;$scope.scriptType = item.type;$scope.groupId = item.groupId;$scope.groupName = item.groupName;
			$scope.index = 1;
			var aa=JSON.stringify(treeData);
			$scope.treeData=JSON.parse(aa);
			//获取脚本列表数据
			httpLoad.loadData({
				url:'/script/list',
				data:{
					page:1,
					rows:10,
					simple:true
				},
				noParam:true,
				success:function(data){
					$scope.scriptListData = data.data.rows;
				}
			})
			//选择脚本来源
			$scope.selectSource = function () {
				$scope.source == 1 ? $scope.codeMirror.options.readOnly = false : $scope.codeMirror.options.readOnly = true;
			}
			//获取脚本内容
			$scope.scriptItem = {};
			$scope.getScriptValue = function(id){
				httpLoad.loadData({
					url:'/script/detail',
					method:'GET',
					data:{
						id:id || $scope.scriptItem.selected.id
					},
					success:function(data){
						if(data.success){
							$timeout(function(){
								$scope.codeMirror.setValue(data.data.content);
							});
						}
					}
				});
			};
			$scope.getScriptValue(item.id);
			$timeout(function(){
				//选择本地脚本
				$('.file').on('change',function(){
					var data = $(this)[0].files[0];
					if (data) {
						//将文件进行转码，转换为text
						var reader = new FileReader();
						reader.readAsText(data);
						reader.onload = function (f) {
							$scope.codeMirror.setValue(this.result);
						}
					}
				});
			},100);


			$scope.ok = function () {
				var sValues = $("#mycombotree1").combotree("getValues");
				var param = {
					id: item.id,
					name: $scope.name,
					content: $scope.codeMirror.getValue(),
					type: $scope.scriptType,
					groupId: sValues[0]
				};
				if(!param.groupId){
					$scope.pop('请选择脚本分组','error');
					return;
				}else  if(!param.content){
					$scope.pop('请输入脚本内容','error');
					return;
				}
				httpLoad.loadData({
					url: '/script/modify',
					method: 'POST',
					data: param,
					success: function (data) {
						$scope.pop('脚本编辑成功');
						$modalInstance.close($scope.name);
					}
				});
			}
			$scope.cancle = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	//详情ctrl
	app.controller('detailScriptModalCtrl', ['$scope', '$modalInstance', 'httpLoad', '$timeout','id',
		function ($scope, $modalInstance, httpLoad, $timeout, id) {
			(function(){
				httpLoad.loadData({
					url:'/script/detail',
					method:'GET',
					data:{
						id:id
					},
					success:function(data){
						if(data.success){
							$scope.detailData = data.data;
							$timeout(function () {
								$scope.codeMirror.options.readOnly = true;
								$scope.codeMirror.setValue(data.data.content);
							},11);
						}
					}
				});
			})();
			$scope.cancle = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	//删除ctrl
	app.controller('delScriptModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
		function ($scope, $modalInstance, httpLoad, id) {
			$scope.ok = function () {
				httpLoad.loadData({
					url: '/script/remove',
					method: 'POST',
					data: {id: id},
					success: function (data) {
						if(data.success){
							$scope.pop('脚本删除成功');
							$modalInstance.close();
						}
					}
				});
			}
			$scope.cancle = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	//在线编辑指令
	app.directive('ngCodeMirrors', ['$timeout',function ($timeout) {
		return {
			restrict: 'EA',
			scope:{
				codeMirror: '='
			},
			link: function (scope, element, attrs) {
				var editor = $(element).find('.textarea')[0];
				$timeout(function(){
					scope.codeMirror = CodeMirror.fromTextArea(editor, {
						theme: 'erlang-dark',
						mode: 'shell',
						lineNumbers: true,
						readOnly: false,
						extraKeys: {
							"F11": function(cm) {
								cm.setOption("fullScreen", !cm.getOption("fullScreen"));
							},
							"Esc": function(cm) {
								if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
							}
						}
					});
					//全屏展示
					$(element).find('.icon-size-fullscreen').on('click',function(){
						var escTip =  $('<div style="z-index:10000;font-size:16px;color:#f05050;position: fixed;top: 10px;left:50%;text-align: center;opacity: 1;font-weigth:bold;background-color: #e7fff8;padding:5px;width:400px;margin-left:-200px;">您现在处于全屏模式，按ESC键可以退出全屏！</div>');
						$(document.body).append(escTip);
						escTip.animate({
							opacity : '0'
						},5000,function(){
							escTip.remove();
						});
						scope.codeMirror.setOption("fullScreen", true);
					});
				},10);
			}
		}
	}]);

	angular.module('app').directive('easyCombotree',
		['$rootScope', '$timeout', 'httpLoad', function ($rootScope,$timeout,httpLoad) {
			return {
				restrict: 'AE',
				scope : {
					treeData        : '=',
					groupId          : '=',
					groupName          : '=',
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
								$('#mycombotree'+scope.index).combotree('tree').tree('options').url = '/script/group/list?parentId='+row.id;
							},
							onSelect:function(row) {
								scope.groupId = row.id;
								scope.groupName = row.text;
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
})()
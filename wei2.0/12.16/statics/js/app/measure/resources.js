(function() {
	"use strict";
	app.factory('instance', function(){
    return {};
	});
	// 组织机构
	app.controller('resourcesCtrl', ['$scope','httpLoad','$rootScope','$modal','$state','$timeout','LANGUAGE','instance','meterService',
	function($scope, httpLoad, $rootScope, $modal, $state, $timeout,LANGUAGE,instance,meterService) {
				$rootScope.moduleTitle = '租户管理 > 账单管理';// 定义当前页
				$rootScope.link = '/statics/css/measure.css';
				$scope.param = {
					page : 1,
					rows : 10,
				};
				//时间函数
				var startTimeFn=function(div1,div2){
					$(div1).datepicker({
	                 changeMonth: true,
	                 changeYear: true,
	                 dateFormat: 'yy-MM',
	                 monthNamesShort :['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
	                 showButtonPanel: true,
//	                 closeText: '确定',
	                 onClose: function(dateText, inst) {
	                     var month = $("#ui-datepicker-div .ui-datepicker-month option:selected").val();//得到选中的月份值
	                     var year = $("#ui-datepicker-div .ui-datepicker-year option:selected").val();//得到选中的年份值
	                     if($(div2).val()!==''){
	                     	 var val=$(div2).val().split('/')[0];
	                     	 var vals=$(div2).val().split('/')[1];
	                     	 if((parseInt(val)>=parseInt(year) && parseInt(vals)>=(parseInt(month)+1)) || (parseInt(val)>parseInt(year))){
		                     if(month>=9){
		                     	$(div1).val(year+'/'+(parseInt(month)+1));
		                     }else{
		                     	$(div1).val(year+'/0'+(parseInt(month)+1));//给input赋值，其中要对月值加1才是实际的月份
		                     }
		                     }else{
		                     	$timeout(
	                     		function(){
	                     			$scope.pop('请选择正确的日期','error');
	                     		},
	                     		200
	                     	)
		                     }
	                     }else{
	                     	 if(month>=9){
		                     	$(div1).val(year+'/'+(parseInt(month)+1));
		                     }else{
		                     	$(div1).val(year+'/0'+(parseInt(month)+1));//给input赋值，其中要对月值加1才是实际的月份
		                     }
	                     }
	                 }
	             });
				};
				
				var endTimeFn=function(div1,div2){
					 $(div1).datepicker({
	                 changeMonth: true,
	                 changeYear: true,
	                 dateFormat: 'yy-MM',
	                 monthNamesShort :['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
	                 showButtonPanel: true,
//	                 closeText: '确定',
	                 onClose: function(dateText, inst) {
	                     var months = $("#ui-datepicker-div .ui-datepicker-month option:selected").val();//得到选中的月份值
	                     var years = $("#ui-datepicker-div .ui-datepicker-year option:selected").val();//得到选中的年份值
	                     if($(div2).val()!==''){
	                     	var val=$(div2).val().split('/')[0];
	                     	var vals=$(div2).val().split('/')[1];
	                     	if((parseInt(val)<=parseInt(years) && parseInt(vals)<=(parseInt(months)+1)) || (parseInt(val)<parseInt(years))){
		                     if(months>=9){
		                     	$(div1).val(years+'/'+(parseInt(months)+1));
		                     }else{
		                     	$(div1).val(years+'/0'+(parseInt(months)+1));//给input赋值，其中要对月值加1才是实际的月份
		                     }
	                     }else{
	                     	$timeout(
	                     		function(){
	                     			$scope.pop('请选择正确的日期','error')
	                     		},
	                     		200
	                     	)
	                     }
	                     }else{
							if(months>=9){
		                     	$(div1).val(years+'/'+(parseInt(months)+1));
		                     }else{
		                     	$(div1).val(years+'/0'+(parseInt(months)+1));//给input赋值，其中要对月值加1才是实际的月份
		                     }
	                     }
	                 }
	             });
				};
				var getDepartPara = function() {
					var userId = $scope.selectUser;
					var departId = instance.id;
					var tenantId = $rootScope.userData.tenantId;
					tenantId = tenantId === null ? 0 : tenantId;
					var mapObj = {};// 返回结果包含参数和url
					var basicPara = {};
					var params = [];
					basicPara.page = $scope.param.page;
					basicPara.rows = $scope.param.rows;
					meterService.addTimepara(params,$('#datapicker').val(),$('#datapicker0').val());
					if($scope.echartsFlag){
						params.push(meterService.construcPara('chart', 'chart'));//仅仅起标志作用，并不作为查询参数
					}
					if (userId) {
						params.push(meterService.construcPara('user_id', userId));
						mapObj.url = '/modulePrice/meatureUser';
						$scope.departGroup = 0;
//						console.log(userId)
					} else {
						params.push(meterService.construcPara('tenant_id', tenantId));
						params.push(meterService.construcPara('depart_id', departId));
						mapObj.url = '/modulePrice/meatureDepart';
						$scope.departGroup = 1;
					}
					basicPara.params = angular.toJson(params);
					mapObj.para = basicPara;
					return mapObj;
				};
				// 请求组织计量信息
				var loadDepartResource = function(callBack) {
					var basicPara = getDepartPara();
					commonQuest(basicPara.url, basicPara.para, callBack);
				};
				// 请求组织机构下拉框数据
				var loadDepartments = function(departmentId) {
					var param = {
						parentId : departmentId
					};
					var url = '/department/list';
					commonQuest(url, param, function(response) {
						var rows = response.data;
						rows.unshift({
							id : 0,
							name : '全部',
						});
						$scope.treeData = rows;
					});
				};
				// 请求用户下拉框数据
				instance.loadUsers = function() {
					var departmentId = instance.id;
					 $scope.selectUser = undefined;
                  	 $scope.users =[];
					if(departmentId===0 || departmentId===""){
						return;
					}
					var param = {
						parentId : departmentId
					};
					var url = '/user/listByDid';
					commonQuest(url, param, function(response) {
						var rows = response.data;
						$scope.users = rows;
					});
				};
				var renderTable = function(response) {
					$scope.departmentsResourceList = response.data.rows;
					$scope.totalRows = response.data.total;
					//非分页函数时请求图表
					if(1==$scope.param.page){
						$scope.echartsFlag = true;
						loadDepartResource(renderChart);
					}
					if (0 == response.data.total) {
						$scope.pop('没有相关查询结果');
					}
				};
				var renderChart = function(response) {
					meterService.constructChartData(response.data.rows,'depart');
				};
				var commonQuest = function(url, param, callBack) {
					httpLoad.loadData({
						url : url,
						method : 'POST',
						data : param,
						noParam : true,
						success : function(response) {
							if (!response.success) {
								$scope.pop(response.message, 'error');
								return;
							}
							callBack(response);
						}
					});
				};
				
				var requestTemplate = function() {
					$scope.echartsFlag = false;
					loadDepartResource(renderTable);
				};

				//页面初始化
				$scope.initPage = function() {
					//切换tab时，会重复调用，仅第一次初始化参数
					if($scope.treeData && $scope.treeData.length>0){
						return;
					}
					
					loadDepartments(0);
					$scope.selectUser;// 用户下拉框Id
					instance.id = 0;// 下拉框组织机构Id
					$scope.departRender = 1;// 1列表展示，2图表展示
					$scope.departGroup = 1; // 列表展示下 1组织机构展示列 2用户展示列
					requestTemplate();
					//日期
					startTimeFn('#datapicker','#datapicker0');
					endTimeFn('#datapicker0','#datapicker');
				};

				// 分页函数
				$scope.getPageList = function(page) {
					$scope.param.page = page || $scope.param.page;
					requestTemplate();
				};
				//重置搜索条件
				$scope.reset = function(){
					$('#datapicker').val('');
					$('#datapicker0').val('');
					$('#mydata').combotree("clear");
					$scope.users='';
					$scope.selectUser='';
				};
				// 提交按钮
				$scope.submit = function() {
					$scope.param.page = 1;
					requestTemplate();
				};
				// 列表展示
				$scope.departList = function() {
					$scope.departRender = 1;
				};
				// 图表展示
				$scope.departChart = function() {
					$scope.departRender = 2;
				};

				// 测试计量
				$scope.meterResource = function() {
					$scope.selectUser =100;
					requestTemplate();
					$scope.selectUser ="undefined";
				};
				
				// 导出按钮
				$scope.exportDepart = function() {
					$scope.echartsFlag = false;
					var basicPara = getDepartPara();
					if (!basicPara) {
						return;
					}
					if ($scope.departGroup==1) {
						meterService.exportExcel("meterResource/departExport",
								basicPara.para.params);
					} else {
						meterService.exportExcel("meterResource/userExport",
								basicPara.para.params);
					}
				};

			} ]);

	// 租户
	app.controller('tenantsCtrl',
			[
					'$scope',
					'httpLoad',
					'$rootScope',
					'$modal',
					'$state',
					'$timeout',
					'LANGUAGE',
					'meterService',
					function($scope, httpLoad, $rootScope, $modal, $state,
							$timeout, LANGUAGE,meterService) {
						$rootScope.moduleTitle = '租户管理 > 账单管理';// 定义当前页
						$rootScope.link = '/statics/css/measure.css';
						if($rootScope.userData.tenantId==null || $rootScope.userData.tenantId==0){
							$scope.tnantshow=true;
						}else{
							$scope.tnantshow=false;
						}
						$scope.param = {
							page : 1,
							rows : 10
						};
						
						//时间函数
						var startTimeFn=function(div1,div2){
							$(div1).datepicker({
			                 changeMonth: true,
			                 changeYear: true,
			                 dateFormat: 'yy-MM',
			                 monthNamesShort :['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
			                 showButtonPanel: true,
			                 onClose: function(dateText, inst) {
			                     var month = $("#ui-datepicker-div .ui-datepicker-month option:selected").val();//得到选中的月份值
			                     var year = $("#ui-datepicker-div .ui-datepicker-year option:selected").val();//得到选中的年份值
			                     if($(div2).val()!==''){
			                     	 var val=$(div2).val().split('/')[0];
			                     	 var vals=$(div2).val().split('/')[1];
			                     	 if((parseInt(val)>=parseInt(year) && parseInt(vals)>=(parseInt(month)+1)) || (parseInt(val)>parseInt(year))){
				                     if(month>=9){
				                     	$(div1).val(year+'/'+(parseInt(month)+1));
				                     }else{
				                     	$(div1).val(year+'/0'+(parseInt(month)+1));//给input赋值，其中要对月值加1才是实际的月份
				                     }
				                     }else{
				                     	$timeout(
			                     		function(){
			                     			$scope.pop('请选择正确的日期','error');
			                     		},
			                     		200
			                     	)
				                     }
			                     }else{
			                     	 if(month>=9){
				                     	$(div1).val(year+'/'+(parseInt(month)+1));
				                     }else{
				                     	$(div1).val(year+'/0'+(parseInt(month)+1));//给input赋值，其中要对月值加1才是实际的月份
				                     }
			                     }
			                 }
			             });
						};
				
						var endTimeFn=function(div1,div2){
							 $(div1).datepicker({
			                 changeMonth: true,
			                 changeYear: true,
			                 dateFormat: 'yy-MM',
			                 monthNamesShort :['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
			                 showButtonPanel: true,
			                 onClose: function(dateText, inst) {
			                     var months = $("#ui-datepicker-div .ui-datepicker-month option:selected").val();//得到选中的月份值
			                     var years = $("#ui-datepicker-div .ui-datepicker-year option:selected").val();//得到选中的年份值
			                     if($(div2).val()!==''){
			                     	var val=$(div2).val().split('/')[0];
			                     	var vals=$(div2).val().split('/')[1];
			                     	if((parseInt(val)<=parseInt(years) && parseInt(vals)<=(parseInt(months)+1)) || (parseInt(val)<parseInt(years))){
				                     if(months>=9){
				                     	$(div1).val(years+'/'+(parseInt(months)+1));
				                     }else{
				                     	$(div1).val(years+'/0'+(parseInt(months)+1));//给input赋值，其中要对月值加1才是实际的月份
				                     }
			                     }else{
			                     	$timeout(
			                     		function(){
			                     			$scope.pop('请选择正确的日期','error')
			                     		},
			                     		200
			                     	)
			                     }
			                     }else{
									if(months>=9){
				                     	$(div1).val(years+'/'+(parseInt(months)+1));
				                     }else{
				                     	$(div1).val(years+'/0'+(parseInt(months)+1));//给input赋值，其中要对月值加1才是实际的月份
				                     }
			                     }
			                 }
			             });
						};
			
						// 租户参数
						var getTenantPara = function() {
							var tenantId = $scope.selectTenant;
							var basicPara = {};
							var params = [];
							basicPara.page = $scope.param.page;
							basicPara.rows = $scope.param.rows;
							meterService.addTimepara(params,$('#from').val(),$('#to').val());
							if($scope.echartsFlag){
								params.push(meterService.construcPara('chart', 'chart'));//仅仅起标志作用，并不作为查询参数
							}
							params.push(meterService.construcPara('tenant_id', tenantId));
							basicPara.params = angular.toJson(params);
							return basicPara;
						};
						// 请求租户计量信息
						var loadTenantResource = function(callBack) {
							var basicPara = getTenantPara();
							var url = '/modulePrice/meatureTenant';
							commonQuest(url, basicPara, callBack);
						};
						// 请求下拉框数据
						var loadTenants = function() {
							var url = '/tenant/list';
							commonQuest(url, null, function(response) {
								var rows = response.data.rows;
								rows.unshift({
									id : 0,
									name : '全部'
								});
								$scope.tenants = rows;
							});
						};
						var renderTable = function(response) {
							$scope.tenantResourceList = response.data.rows;
							$scope.totalRows = response.data.total;
							//非分页函数时请求图表
							if(1==$scope.param.page){
								$scope.echartsFlag = true;
								loadTenantResource(renderChart);
							}
							if (0 == response.data.total) {
								$scope.pop('没有相关查询结果');
							}
						};
						var renderChart = function(response) {
							meterService.constructChartData(response.data.rows,'tanant');
						};
						var commonQuest = function(url, param, callBack) {
							httpLoad.loadData({
								url : url,
								method : 'POST',
								data : param,
								noParam : true,
								success : function(response) {
									if (!response.success) {
										$scope.pop(response.message, 'error');
										return;
									}
									callBack(response);
								}
							});
						};

						var requestTemplate = function() {
							$scope.echartsFlag = false;//false列表展示，true图表展示
							loadTenantResource(renderTable);
						};

						$scope.initPage = function() {
							if($scope.tenants && $scope.tenants.length>0){
								return;
							}
							$scope.selectTenant = 0;
							loadTenants();
							$scope.tenantRender = 1;
							$scope.param.page = 1;
							requestTemplate();
							startTimeFn('#from','#to');
							endTimeFn('#to','#from');			
						}

						// 分页函数
						$scope.getPageList = function(page) {
							$scope.param.page = page || $scope.param.page;
							requestTemplate();
						}

						// 提交按钮
						$scope.submit = function() {
							$scope.param.page = 1;
							requestTemplate();
						};
						// 列表展示
						$scope.tenantList = function() {
							$scope.tenantRender = 1;
						};
						// 图表展示
						$scope.tenantChart = function() {
							$scope.tenantRender = 2;
						};
						
						//重置搜索条件
						$scope.reset = function(){
							$('#from').val('');
							$('#to').val('');
							$scope.selectTenant=0;
						};
						// 导出按钮
						$scope.exportTenant = function() {
							$scope.echartsFlag = false;
							var basicPara = getTenantPara();
							if (!basicPara) {
								return;
							}
							meterService.exportExcel("/meterResource/tenantExport",
									basicPara.params);
						};
					} ]);
	
	//组织机构树指令
	angular.module('app').directive('easyuiCombotree',
		['$rootScope', '$timeout', 'httpLoad','instance', function ($rootScope,$timeout,httpLoad,instance) {
			return {
				restrict: 'AE',
				scope : {
					treeData        : '=',
					instance     : '=',
					loadUsers	 : '=',
				},
				link: function (scope, element, attrs) {
					scope.$watch('treeData',function(newValue,oldValue){
						element.combotree({
							data: scope.treeData,
							textField :"text",
							valueField : "id",
							emptyText : '全部',
							onBeforeExpand: function(row,param){
									$('#mydata').combotree('tree').tree('options').url = '/department/list?parentId='+row.id;
                            },
							onSelect:function(row) {
								instance.id = row.id;
								instance.loadUsers();
							},
							onLoadSuccess :function(node, data){
//								
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
//										checked:row.checked,
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
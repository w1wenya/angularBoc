(function() {
	"use strict";
	app.factory('instance', function(){
    return {};
	});
	// 组织机构
	app.controller('resourcesCtrl', ['$scope','httpLoad','$rootScope','$modal','$state','$timeout','LANGUAGE','instance','meterService',
	function($scope, httpLoad, $rootScope, $modal, $state, $timeout,LANGUAGE,instance,meterService) {
				$rootScope.moduleTitle = '计量计费 > 资源计量';// 定义当前页
				$rootScope.link = '/statics/css/measure.css';
				$scope.param = {
					page : 1,
					rows : 10,
				};
				//时间函数
				var fromFun=function(div1,div2){
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
				}
				
				var toFun=function(div1,div2){
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
				}
			
				
				var getDepartPara = function() {
					var userId = $scope.selectUser;
					var departId = instance.id;
					var tenantId = $rootScope.userData.tenantId;
					tenantId = tenantId === null ? 0 : tenantId;
					if ((typeof (userId) == "undefined" && typeof (departId) == "undefined")|| (userId === "" && departId === "")) {
                    $scope.pop('请选择组织机构或者用户');
                    return;
                  }
					var mapObj = {};// 返回结果包含参数和url
					var basicPara = {};
					var params = [];
					basicPara.page = $scope.param.page;
					basicPara.rows = $scope.param.rows;
					meterService.addTimepara(params,$('#datapicker').val(),$('#datapicker0').val());
					if($scope.echartsFlag){
						if($scope.export !==0){
							params.push(meterService.construcPara('chart', 'chart'));//仅仅起标志作用，并不作为查询参数
						}
						
					}
					if (typeof (userId) !== "undefined") {
						params.push(meterService.construcPara('user_id', userId));
						mapObj.url = '/modulePrice/meatureUser';
						$scope.departGroup = 0;
//						console.log(userId)
					} else {
						if( departId === ""){
							$scope.pop('请选择组织机构');
							return;
						}
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
					if (!basicPara) {
						return;
					}
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
							if (0 == response.data.total) {
								$scope.pop('没有相关查询结果');
							}
							callBack(response);
						}
					});
				};
				
				var requestTemplate = function() {
					$scope.param.page = 1;
					$scope.echartsFlag = false;//false列表展示，true图表展示
					loadDepartResource(renderTable);
				};

				//页面初始化
				$scope.initPage = function() {
					$scope.export=0;
					loadDepartments(0);
					$scope.selectUser;// 用户下拉框Id
					instance.id = 0;// 下拉框组织机构Id
					$scope.departRender = 1;// 1列表展示，2图表展示
					$scope.departGroup = 1; // 列表展示下 1组织机构展示列 2用户展示列
					requestTemplate();
					//日期
					fromFun('#datapicker','#datapicker0');
					toFun('#datapicker0','#datapicker');
				}

				// 分页函数
				$scope.getPageList = function(page) {
					$scope.param.page = page || $scope.param.page;
					$scope.echartsFlag = false;
					loadDepartResource(renderTable);
				}

				// 提交按钮
				$scope.submit = function() {
					if($('#datapicker').val()!=='' && $('#datapicker0').val()!==''){
						$scope.date=$('#datapicker').val()+' - '+$('#datapicker0').val();
						if($scope.date===' - '){
							$scope.date='';
						}
					}else if($('#datapicker').val()!=='' && $('#datapicker0').val()===''){
//						$scope.pop('请选择开始日期和结束日期','error');
						$scope.date='';
					}
					if($scope.selectUser===''){
						$scope.pop('请选择用户','error');
					}else{
						if($scope.departRender == 1){
						requestTemplate();
						}
						if($scope.departRender == 2){
							$scope.echartsFlag = true;
							loadDepartResource(renderChart);
						}
					}
					
					
					
				};
				// 列表展示
				$scope.departList = function() {
					$scope.departRender = 1;
				};
				// 图表展示
				$scope.departChart = function() {
					$scope.departRender = 2;
					$scope.echartsFlag = true;
					loadDepartResource(renderChart);
				};

				// 导出按钮
				$scope.exportDepart = function() {
					$scope.export=0;
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
						$rootScope.moduleTitle = '计量计费 > 资源计量';// 定义当前页
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
						var fromFun=function(div1,div2){
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
						}
				
						var toFun=function(div1,div2){
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
						}
			
						// 租户参数
						var getTenantPara = function() {
							var tenantId = $scope.selectTenant;
							if ('' === tenantId
									|| typeof (tenantId) == "undefined") {
								$scope.pop('请选择租户', 'error');
								return;
							}
							var basicPara = {};
							var params = [];
							basicPara.page = $scope.param.page;
							basicPara.rows = $scope.param.rows;
							meterService.addTimepara(params,$('#from').val(),$('#to').val());
							if($scope.echartsFlag){
								if($scope.export !==0){
									params.push(meterService.construcPara('chart', 'chart'));//仅仅起标志作用，并不作为查询参数
								}
								
							}
							params.push(meterService.construcPara('tenant_id', tenantId));
							basicPara.params = angular.toJson(params);
							return basicPara;
						};
						// 请求租户计量信息
						var loadTenantResource = function(callBack) {
							var basicPara = getTenantPara();
							if (!basicPara) {
								return;
							}
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
									if (0 == response.data.total) {
										$scope.pop('没有相关查询结果');
									}
									callBack(response);
								}
							});
						};

						var requestTemplate = function() {
							$scope.param.page = 1;
							$scope.echartsFlag = false;//false列表展示，true图表展示
							loadTenantResource(renderTable);
						};

						$scope.initPage = function() {
							$scope.selectTenant = 0;
							loadTenants();
							$scope.tenantRender = 1;
							requestTemplate();
							fromFun('#from','#to');
							toFun('#to','#from');			
						}

						// 分页函数
						$scope.getPageList = function(page) {
							$scope.param.page = page || $scope.param.page;
							$scope.echartsFlag = false;
							loadTenantResource(renderTable); 
						}

						// 提交按钮
						$scope.submit = function() {
							if($('#from').val()!=='' && $('#to').val()!==''){
								$scope.date=$('#from').val()+' - '+$('#to').val();
									if($scope.date===' - '){
										$scope.date='';
									}
							}else if($('#from').val()!=='' && $('#to').val()===''){
//								$scope.pop('请选择开始日期和结束日期','error');
								$scope.date='';
							}
							
							if($scope.tenantRender == 1){
								requestTemplate();
								}
								if($scope.tenantRender == 2){
									$scope.echartsFlag = true;
									loadTenantResource(renderChart);
								}
						};
						// 列表展示
						$scope.tenantList = function() {
							$scope.tenantRender = 1;
						};
						// 图表展示
						$scope.tenantChart = function() {
							$scope.tenantRender = 2;
							$scope.echartsFlag = true;
							loadTenantResource(renderChart);
						};

						// 导出按钮
						$scope.exportTenant = function() {
							$scope.export=0;
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
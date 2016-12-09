(function(){
	"use strict";
	app.controller('priceCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal,$state, $timeout,LANGUAGE) {
			$rootScope.moduleTitle = '计量计费 > 组件价格管理';//定义当前页
			$scope.param = {
				rows: 10
			};
			//获取用户列表
			$scope.getData = function(page){
				$scope.param.page = page || $scope.param.page;
				//对时间进行处理
				var toFormatTime = function(time, place) {
					if (!time) return "";
					var date = time.split(' - ');
					return date[place/1];
				}
				
				var params=[];
				var basicPara={};
				basicPara.page = $scope.param.page;
				basicPara.rows = $scope.param.rows;
				if ($scope.date) {
					params.push({param: {price_start: toFormatTime($scope.date, 0)}, sign: 'LET'});
					params.push({param: {price_end: toFormatTime($scope.date, 1)}, sign: 'GET'});
					basicPara.params = angular.toJson(params);
				}
				
				httpLoad.loadData({
					url:'/modulePrice/list',
					method: 'POST',
					data: basicPara,
					noParam: true,
					success:function(data){
						$scope.totalCount = data.data.total;
						$scope.datalist=data.data.rows;
					}
				});
			};
			$scope.getData(1);
		//搜索
		$scope.search = function(){
			//对时间进行处理
//			var toFormatTime = function(time, place) {
//				if (!time) return "";
//				var date = time.split(' - ');
//				return date[place/1];
//			}
//			var params = [];
//			if ($scope.date) {
//				params.push({param: {gmtCreate: toFormatTime($scope.date, 0)}, sign: 'GET'});
//				params.push({param: {gmtCreate: toFormatTime($scope.date, 1)}, sign: 'LET'});
//			}
//			$scope.param = {
//				page: 1,
//				rows: 10,
//				params: angular.toJson(params)
//			}
			$scope.getData(1)
		};
			//新增
			$scope.add = function($event){
				$scope.unit="";
				$scope.period="";
				$scope.price="";
				$scope.name="";
				$scope.priceStart="";
				$scope.priceEnd="";
				$scope.id="";
				$scope.type="";
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/config/component/add.html',
					controller : 'addUserModalCtrl'
					
//					resolve : {
//						addlist : function(){
//							return $scope.dataList;
//						}
//					}
				});
				modalInstance.result.then(function(result){
					$scope.getData();
				},function(){});
			};
			//编辑
			$scope.update = function($event,$index,row){
				$event.stopPropagation();
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/config/component/edit.html',
					controller : 'editModalCtrl',
					resolve : {
						id : function(){
							return row.id;
						},
						updateData : function(){
							return $scope.datalist[$index];
						}
					}
				});
				modalInstance.result.then(function(){
					$scope.getData();
				},function(){});
			};
			//删除
			$scope.remove = function(id,$event,$index){
				if($event) $event.stopPropagation();
				$scope.removeData= {"id" : id};
				var modalInstance = $modal.open({
					templateUrl : '/statics/tpl/config/component/remove.html',
					controller : 'removeUserModalCtrl',
					resolve : {
						index : function(){
							return $index;
						},
						removeData : function(){
							return $scope.removeData;
						},
						datalist : function(){
							return $scope.datalist;
						}
					}
				});
				modalInstance.result.then(function(){
					$scope.getData();
				},function(){});
			};
		}
	]);

	//新增ctrl
	app.controller('addUserModalCtrl',['$scope','$modalInstance','httpLoad','LANGUAGE',
		function($scope,$modalInstance,httpLoad,LANGUAGE){ //依赖于modalInstance
//			var aa=JSON.stringify(addlist);
//			$scope.addlist=JSON.parse(aa);
			$scope.ok = function(){
				$scope.dataList={
						unit:$scope.unit,
						period:$scope.period,
						price:$scope.price,
						name:$scope.name,
						priceStart:$scope.priceStart,
						priceEnd:$scope.priceEnd,
						id:$scope.id,
						type:$scope.type
					}
				httpLoad.loadData({
					url:'/modulePrice/create',
					method:'POST',
					data: $scope.dataList,
					success:function(data){
						if(data.success){
							$scope.pop(LANGUAGE.OPERATION.USER.ADD_SUCCESS);
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel'); // 退出
			}
		}]);
	//编辑ctrl
	app.controller('editModalCtrl',['$scope','$modalInstance','httpLoad','updateData','LANGUAGE',
		function($scope,$modalInstance,httpLoad,updateData,LANGUAGE){ //依赖于modalInstance
			var aa=JSON.stringify(updateData);
			$scope.updateData=JSON.parse(aa);
			$scope.ok = function(){
				httpLoad.loadData({
					url:'/modulePrice/modify',
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
	app.controller('removeUserModalCtrl',['$scope','$modalInstance','httpLoad','removeData','datalist','index','LANGUAGE',
		function($scope,$modalInstance,httpLoad,removeData,datalist,index,LANGUAGE){ //依赖于modalInstance
			$scope.ok = function(){
				httpLoad.loadData({
					url:'/modulePrice/remove',
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
	
})();
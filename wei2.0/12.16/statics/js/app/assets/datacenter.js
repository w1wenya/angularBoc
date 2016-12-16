(function () {
	"use strict";
	app.controller('DataCenterCtrl', ['$scope', '$rootScope', '$http','$modal', 'httpLoad', '$timeout', '$state', function ($scope, $rootScope, $http, $modal, httpLoad, $timeout, $state) {
		$rootScope.moduleTitle = '资源管理 > 数据中心';
		$rootScope.link = '/statics/css/tpl-card.css';
		$scope.param = {
			page: 1,
			rows: 10
		};
		$scope.isCheck = true;
		//刷新
		$scope.refresh = function () {
			$scope.loadDataCenterList();
		};
		//批量管理
		$scope.batchManage = function () {
			$scope.isCheck = !$scope.isCheck;
			$scope.isbacthmanage = !$scope.isbacthmanage;
			if (!$scope.isbacthmanage) {
				angular.forEach($scope.dataCenterList, function (data, index) {
					data.isChose = false;
				});
			}
		};
		$scope.chooseRepository = function ($event, id) {
			$event.stopPropagation();
			angular.forEach($scope.dataCenterList, function (data, index) {
				if (data.id == id) {
					data.isChose = !data.isChose;
				}
			});
		};
		//批量删除
		$scope.batchDelete = function () {
			if ($scope.isCheck) return;
			$scope.deleteList = [];
			angular.forEach($scope.dataCenterList, function (data, index) {
				if (data.isChose == true) {
					$scope.deleteList.push(data.id);
				}
			});
			if ($scope.deleteList.length == 0) return;
			$scope.remove($scope.deleteList);
		};
		$scope.loadDataCenterList = function (page) {
			$scope.param.page = page || $scope.param.page;
			httpLoad.loadData({
				url: '/dc/list',
				data: $scope.param,
				noParam: true,
				success: function (data) {
					if (data.success) {
						$scope.dataCenterList = data.data.rows;
						$scope.totalCount = data.data.total;
					}
				}
			});
		};
		$scope.loadDataCenterList(1);
		//搜索
		$scope.search = function () {
			//对参数进行处理，去除空参数
			var toObjFormat = function (obj) {
				for (var a in obj) {
					if (obj[a] == "") delete obj[a];
				}
				return obj;
			}
			var params = [];
			var param1 = toObjFormat({
				name: $scope.name
			});
			if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson(params)
			}
			$scope.loadDataCenterList();
		}
		//重置搜索条件
		$scope.reset = function () {
			var obj = ['name'];
			angular.forEach(obj, function (data) {
				$scope[data] = '';
			})
		}
		$scope.goDetail = function ($event, id) {
			$event.stopPropagation();
			$state.go('app.assets.centerdetail', {id: id})
		};
		$scope.goMonitor = function ($event, id) {
			$event.stopPropagation();
			$state.go('app.monitor.datacenterMonitor', {id: id})
		}
		//编辑
		$scope.update = function ($event, id) {  //打开模态
			$event.stopPropagation();
			httpLoad.loadData({
				url: '/dc/basic',
				method: 'GET',
				data: {id: id},
				success: function (data) {
					if (data.success) {
						var modalInstance = $modal.open({
							templateUrl: '/statics/tpl/assets/datacenter/update.html',  //指向上面创建的视图
							controller: 'updateDataCenterModalCtrl',// 初始化模态范围
							backdrop: 'static',
							resolve: {
								id: function () {
									return id;
								},
								updateData: function () {
									return data.data;
								}
							}
						});
						modalInstance.result.then(function () {
							$scope.loadDataCenterList();
						});
					}
				}
			});
		};
		//新增
		$scope.add = function ($event, size) {  //打开模态
			$event.stopPropagation();
			if ($scope.dataCenterList) {
				var length = $scope.dataCenterList.length || 0;
				if (length >= 10) {
					$scope.pop('数据中心数量已达上限10个，无法添加', 'error');
					return;
				}
			}
			var modalInstance = $modal.open({
				templateUrl: '/statics/tpl/assets/datacenter/add.html',  //指向上面创建的视图
				controller: 'addDataCenterModalCtrl',// 初始化模态范围
				size: size, //大小配置
				backdrop: 'static',
				resolve: {
					dataList: function () {
						return $scope.dataCenterList;
					}
				}
			});
			modalInstance.result.then(function (result) {
				$scope.loadDataCenterList();
			});
		};
		//删除
		$scope.remove = function ($event, id) {  //打开模态
			$event.stopPropagation();
			var modalInstance = $modal.open({
				templateUrl: '/statics/tpl/assets/datacenter/remove.html',  //指向上面创建的视图
				controller: 'removeDataCenterModalCtrl',// 初始化模态范围
				resolve: {
					id: function () {
						return id;
					}
				}
			});
			modalInstance.result.then(function () {
				$scope.loadDataCenterList();
			});
		};
	}]);
	app.controller('updateDataCenterModalCtrl', ['$scope', '$modalInstance', 'httpLoad', '$http','LANGUAGE', 'updateData',
		function ($scope, $modalInstance, httpLoad, $http, LANGUAGE, updateData) { //依赖于modalInstance
			var aa = JSON.stringify(updateData);
			$scope.updateData = JSON.parse(aa);
			$scope.updateData.totalArea = parseInt($scope.updateData.totalArea);
			$scope.today = new Date();
			$http.get('/statics/api/map/map.json').then(function(data){
				$scope.chinaMap = data.data;
				//拉去默认城市数据
				$scope.chinaMap.forEach(function (item) {
					if($scope.updateData.province == item.name){
						$scope.provinceItem = item;
						$scope.cityData = item.children;
						return false;
					}
				})
				$scope.cityData.forEach(function (item) {
					if($scope.updateData.city == item.name){
						$scope.cityItem = item;
						return false;
					}
				});
			});
			$scope.selectProvince = function () {
				$scope.cityData = JSON.parse($scope.provinceItem).children;
			};
			$scope.ok = function () {
				//获取坐标
				$scope.updateData.province = angular.fromJson($scope.provinceItem).name;
				var cityItem = angular.fromJson($scope.cityItem);
				$scope.updateData.city = cityItem.name;
				$scope.updateData.coordinate = cityItem.log+','+cityItem.lat;
				httpLoad.loadData({
					url: '/dc/modify',
					data: $scope.updateData,
					success: function (data) {
						if (data.success) {
							$scope.updateResult = $scope.updateData;
							$scope.pop(LANGUAGE.ASSETS.CENTER.EDIT_SUCCESS);
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel'); // 退出
			}
		}]);
	app.controller('addDataCenterModalCtrl', ['$scope', '$modalInstance','$http', 'httpLoad', 'LANGUAGE', 'dataList',
		function ($scope, $modalInstance,$http, httpLoad, LANGUAGE, dataList) { //依赖于modalInstance
			$http.get('/statics/api/map/map.json').then(function(data){
				$scope.chinaMap = data.data;;
			});
			$scope.selectProvince = function () {
				$scope.cityData = JSON.parse($scope.provinceItem).children;
			};
			$scope.today = new Date();
			$scope.isSame = false;
			$scope.foucs = function () {
				$scope.isSame = false;
				$scope.adddataCenterForm.$invalid = false;
			};
			$scope.blur = function () {
				$scope.isSame = false;
				$scope.adddataCenterForm.$invalid = false;
			};
			
			$scope.ok = function () {
				for (var a in dataList) {
					if (dataList[a].name == $scope.addData.name) {
						$scope.isSame = true;
						$scope.adddataCenterForm.$invalid = true;
					}
				}
				//获取坐标
				$scope.addData.province = JSON.parse($scope.provinceItem).name;
				var cityItem = JSON.parse($scope.cityItem);
				$scope.addData.city = cityItem.name;
				$scope.addData.coordinate = cityItem.log+','+cityItem.lat;
				if (!$scope.isSame) {
					httpLoad.loadData({
						url: '/dc/create',
						data: $scope.addData,
						success: function (data) {
							if (data.success) {
								$scope.pop(LANGUAGE.ASSETS.CENTER.ADD_SUCCESS);
								$modalInstance.close();
							}
						}
					});
				}
			};
			
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel'); // 退出
			}
		}]);
	app.controller('removeDataCenterModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'LANGUAGE', 'id',
		function ($scope, $modalInstance, httpLoad, LANGUAGE, id) { //依赖于modalInstance
			$scope.ok = function () {
				httpLoad.loadData({
					url: '/dc/remove',
					data: {id: id},
					success: function (data) {
						if (data.success) {
							$scope.pop(LANGUAGE.ASSETS.CENTER.DEL_SUCCESS);
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel'); // 退出
			}
		}]);
})();
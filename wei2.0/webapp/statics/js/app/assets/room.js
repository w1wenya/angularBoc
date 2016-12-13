/**
 * Created by Zhang Haijun on 2016/8/9.
 */
(function () {
	'use strict';
	app.controller('RoomCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', '$timeout', '$state', '$stateParams', function ($rootScope, $scope, httpLoad, $modal, $timeout, $state, $stateParams) {
		$rootScope.moduleTitle = '资源中心 > 机房管理';
		$rootScope.link = '/statics/css/tpl-card.css';
		$scope.param = {
			page: 1,
			rows: 10
		};
		//详情列表
		if ($stateParams.id) {
			$rootScope.moduleTitle = '资源中心 > 数据中心详情';
			$scope.hideSearch = true;
			$scope.param.params = angular.toJson([{param: {dcId: $stateParams.id}, sign: 'EQ'}])
		}
		$scope.isCheck = true;
		//刷新
		$scope.refresh = function () {
			$scope.loadRoomList();
		};
		//批量管理
		$scope.batchManage = function () {
			$scope.isCheck = !$scope.isCheck;
			$scope.isbacthmanage = !$scope.isbacthmanage;
			if (!$scope.isbacthmanage) {
				angular.forEach($scope.roomListData, function (data, index) {
					data.isChose = false;
				});
			}
		};
		$scope.chooseRepository = function ($event, id) {
			$event.stopPropagation();
			angular.forEach($scope.roomListData, function (data, index) {
				if (data.id == id) {
					data.isChose = !data.isChose;
				}
			});
		};
		//批量删除
		$scope.batchDelete = function () {
			if ($scope.isCheck) return;
			$scope.deleteList = [];
			angular.forEach($scope.roomListData, function (data, index) {
				if (data.isChose == true) {
					$scope.deleteList.push(data.id);
				}
			});
			if ($scope.deleteList.length == 0) return;
			$scope.remove($scope.deleteList);
		};
		$scope.loadRoomList = function () {
			httpLoad.loadData({
				url: '/room/list',
				data: $scope.param,
				noParam: true,
				success: function (data) {
					if (data.success) {
						$scope.roomListData = data.data.rows;
						$scope.totalCount = data.data.total;
					}
				}
			});
		};
		$scope.loadRoomList(1);
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
			$scope.loadRoomList();
		}
		//重置搜索条件
		$scope.reset = function () {
			var obj = ['name'];
			angular.forEach(obj, function (data) {
				$scope[data] = '';
			})
		}
		//获取数据中心列表数据
		httpLoad.loadData({
			url: '/dc/list',
			noParam: true,
			success: function (data) {
				if (data.success) {
					$scope.dataCenterList = data.data.rows;
				}
			}
		});
		//获取机柜类型列表数据
		httpLoad.loadData({
			url: '/dict/children',
			method: 'GET',
			data: {
				value: "ROOM_CATEGORY",
			},
			success: function (data) {
				if (data.success) {
					$scope.dataType = data.data;
				}
			}
		});
		$scope.goDetail = function ($event, id) {
			$event.stopPropagation();
			$state.go('app.assets.roomdetail', {id: id})
		};
		$scope.goMonitor = function ($event, id) {
			$event.stopPropagation();
			$state.go('app.monitor.roomMonitor', {id: id})
		}
		//添加/编辑机房
		$scope.update = function ($event, id) {
			$event.stopPropagation();
			if ($scope.roomListData) {
				var length = $scope.roomListData.length || 0;
				if (length >= 10) {
					$scope.pop('机房数量已达上限10个，无法添加', 'error');
					return;
				}
			}
			var modalInstance = $modal.open({
				templateUrl: '/statics/tpl/assets/room/addRoomModal.html',
				controller: 'addRoomModalCtrl',
				backdrop: 'static',
				resolve: {
					dataCenterData: function () {
						return $scope.dataCenterList;
					},
					dataType: function () {
						return $scope.dataType;
					},
					id: function () {
						return id || '';
					}
				}
			});
			modalInstance.result.then(function (data) {
				$scope.loadRoomList();
			});
		}
		//删除机柜
		$scope.remove = function ($event, id) {
			$event.stopPropagation();
			var modalInstance = $modal.open({
				templateUrl: '/statics/tpl/assets/room/delRoomModal.html',
				controller: 'delRoomModalCtrl',
				backdrop: 'static',
				resolve: {
					id: function () {
						return id;
					}
				}
			});
			modalInstance.result.then(function () {
				$scope.loadRoomList();
			});
		}
	}]);
//添加/编辑机房ctrl
	app.controller('addRoomModalCtrl', ['$scope', '$modalInstance', '$stateParams', 'httpLoad', 'dataCenterData', 'dataType', 'id',
		function ($scope, $modalInstance, $stateParams, httpLoad, dataCenterData, dataType, id) {
			$scope.modalName = '添加机房';
			$scope.today = new Date();
			if ($stateParams.id) {
				$scope.disableSelect = true;
				$scope.dcId = $stateParams.id;
			}
			var editObj = ['dcId', 'locationSn', 'totalArea', 'contacter', 'name', 'remark', 'contactPhone', 'type', 'rowNum', 'colNum', 'commissionDate'];
			$scope.dataCenterData = dataCenterData;
			$scope.dataType = dataType;
			var url = '/room/create';
			//如果为编辑，进行赋值
			if (id) {
				url = '/room/modify';
				$scope.modalName = '编辑机房';
				httpLoad.loadData({
					url: '/room/basic',
					method: 'GET',
					data: {id: id},
					success: function (data) {
						if (data.success) {
							var data = data.data;
							for (var a in editObj) {
								var attr = editObj[a];
								$scope[attr] = data[attr];
							}
							$scope.totalArea = parseInt($scope.totalArea);
							$scope.rowNum = parseInt($scope.rowNum);
							$scope.colNum = parseInt($scope.colNum);
						}
					}
				});
			}
			//机柜存放范围
			$scope.outFouse = function () {
				if (id) {
					if (!$scope.rowNum || !$scope.colNum) {
						return false;
					}
					var param = {rowNum: $scope.rowNum, colNum: $scope.colNum, id: id};
				} else {
					return false;
				}
				httpLoad.loadData({
					url: '/room/checkRange',
					method: 'GET',
					data: param,
					success: function (data) {
						if (data.success) $scope.isFail = false;
						else $scope.isFail = true;
						;
					}
				});
			};
			//保存按钮
			$scope.ok = function () {
				var param = {};
				for (var a in editObj) {
					var attr = editObj[a];
					param[attr] = $scope[attr];
				}
				if (id) param.id = id;
				httpLoad.loadData({
					url: url,
					data: param,
					success: function (data) {
						if (data.success) {
							var popText = '机房添加成功';
							if (id) popText = '机房修改成功';
							$scope.pop(popText);
							$modalInstance.close(data);
						}
					}
				});
			}
			$scope.cancle = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
//删除机房ctrl
	app.controller('delRoomModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
		function ($scope, $modalInstance, httpLoad, id) {
			$scope.ok = function () {
				httpLoad.loadData({
					url: '/room/remove',
					data: {id: id},
					success: function (data) {
						if (data.success) {
							$scope.pop("机房删除成功");
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
})();
app.controller('AddDataBaseCtrl', ['$rootScope', '$scope', '$state', 'httpLoad', '$stateParams',  function ($rootScope, $scope, $state, httpLoad, $stateParams) {
	$rootScope.link = '/statics/css/user.css';
	$rootScope.moduleTitle = '资源管理 > 数据库管理';
	$scope.status = $stateParams.flag;
	sessionStorage.setItem('tabLocation','2');
	$scope.goBack = function () {
		history.go(-1);
	};
}]);
app.controller('AddAliDbCtrl', ['$rootScope', '$scope', '$state', 'httpLoad', '$stateParams', '$timeout', function ($rootScope, $scope, $state, httpLoad, $stateParams, $timeout) {
	$scope.addData = {
		vendorId:$stateParams.id,
		disk:5,
		payType:'Postpaid'
	};
	//获取地域数据
	(function () {
		httpLoad.loadData({
			url: '/region/list',
			method: 'POST',
			data: {"id": $stateParams.id},
			success: function (data) {
				if (data.success) {
					$scope.regionData = data.data;
					if($scope.regionData.length > 0){
						var item = $scope.regionData[0];
						item.isRegionActive = true;
						$scope.addData.regionId = item.regionId
						$scope.addData.region = item.id;
						$scope.getAvailableRegion();
					};
				}
			}
		});
	})();
	$scope.rangeOptions = {
		floor: 5,
		ceil: 2000,
		step: 1,
		translate: function(value) {
			return value+'G';
		},
	}
	$scope.getAvailableRegion = function () {
		var param = [{"param": {"regionId":$scope.addData.regionId,"vendorId": $stateParams.id},	"sign": "EQ"}]
		httpLoad.loadData({
			url: '/zone/list',
			method: 'POST',
			data: {
				simple:true,
				params:angular.toJson(param)
			},
			noParam: true,
			success: function (data) {
				if (data.success) {
					$scope.configs = '';
					$scope.availableRegion = data.data.rows;
					if($scope.availableRegion.length > 0){
						var item = $scope.availableRegion[0];
						$scope.addData.zoneId = item.value;
						$scope.selectAvailableRegion(item.value);
					}
				}
			}
		});
	};
	//选择可用区数据
	$scope.selectAvailableRegion = function (id) {
		var handleData = function(data){
			$scope.addData.engine = data.engine[0].value;
			$scope.addData.instanceClass = data.instanceClass[0].value;
			$scope.chooseVersion(data.version[0]);
			$scope.chooseNet(data.netType[0]);
		};
		httpLoad.loadData({
			url: '/db/ins/configs',
			method: 'GET',
			data: {
				id:id
			},
			success: function (data) {
				if (data.success) {
				  $scope.configs = angular.fromJson(data.data);
					$timeout(function () {
						handleData($scope.configs);
						});
				};
			}
		});
	};
	//选择版本chooseRegion
	$scope.chooseVersion = function (item) {
		if(item.isRegionActive) return;
		angular.forEach($scope.configs.version, function (data, index) {
			data.isRegionActive = false;
			if (data.value == item.value) {
				data.isRegionActive = true;
				$scope.addData.version =  item.value;
			}
		});
	};
	$scope.chooseRegion = function (item) {
		if(item.isRegionActive) return;
		angular.forEach($scope.regionData, function (data, index) {
			data.isRegionActive = false;
			if (data.id == item.id) {
				data.isRegionActive = true;
				$scope.addData.regionId = item.regionId
				$scope.addData.region = item.id;
				$scope.getAvailableRegion();
			}
		});
	};
	//选择网络
	$scope.chooseNet = function (item) {
		if(item.isRegionActive) return;
		angular.forEach($scope.configs.netType, function (data, index) {
			data.isRegionActive = false;
			if (data.value == item.value) {
				data.isRegionActive = true;
				$scope.addData.netType =  item.value;
			}
		});
	};
	$scope.selectDiskSize = function(){
		if($scope.addData.disk=="" || $scope.addData.disk < 5) $scope.addData.disk = 5;
		if($scope.addData.disk > 2000) $scope.addData.disk = 2000;
	};
	$scope.ok = function () {
		httpLoad.loadData({
			url: '/db/ins/create',
			method: 'POST',
			data: $scope.addData,
			success: function (data) {
				if (data.success) {
					$scope.pop("数据库创建成功");
					$scope.goBack();
				}
			}
		});
	};
	$scope.cancel = function () {
		$scope.goBack();
	};
	
}]);

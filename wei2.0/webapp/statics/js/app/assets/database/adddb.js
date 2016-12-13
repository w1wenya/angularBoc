app.controller('AddDataBaseCtrl', ['$rootScope', '$scope', '$state', 'httpLoad', '$stateParams', '$modal', function ($rootScope, $scope, $state, httpLoad, $stateParams, $modal) {
	$rootScope.link = '/statics/css/user.css';
	$rootScope.moduleTitle = '资源中心 > 数据库管理';
	
	$scope.status = $stateParams.flag
	$scope.goBack = function () {
		history.go(-1);
	};
}]);
app.controller('AddAliDbCtrl', ['$rootScope', '$scope', '$state', 'httpLoad', '$stateParams', '$modal', function ($rootScope, $scope, $state, httpLoad, $stateParams, $modal) {
	
	$scope.addData = {};
	$scope.param = {};
	$scope.isselectSize = false;
	
	//获取地域数据
	(function () {
		httpLoad.loadData({
			url: '/region/list',
			method: 'POST',
			data: {"id": $stateParams.id},
			success: function (data) {
				if (data.success) {
					$scope.regionData = data.data;
					angular.forEach($scope.regionData, function (data, index) {
						//默认选中第一个区域
						if (index == 0) {
							data.isRegionActive = true;
							$scope.addData.region = data.id;
							$scope.getAvailableRegion(data.regionId);
						}
						else data.isRegionActive = false;
					});
				}
			}
		});
	})();
	//获取安全组数据(和地域挂钩，如果安全组没数据就不显示)
	$scope.getSecurityData = function () {
		var params = {
				"simple": true
			},
			searchParam = [{"param": {"vendorId": vmTabvendor.id}, "sign": "EQ"}, {
				"param": {"region": $scope.addData.region},
				"sign": "EQ"
			}];
		params.params = JSON.stringify(searchParam);
		httpLoad.loadData({
			url: '/security/group/list',
			method: 'POST',
			data: params,
			noParam: true,
			success: function (data) {
				if (data.success && data.data.rows && data.data.rows.length != 0) {
					$scope.issecurityGroup = true;
					$scope.securityList = data.data.rows;
					angular.forEach($scope.securityList, function (data, index) {
						//默认选中第一个可用区
						if (index == 0) $scope.addData.securityGroupId = data.value;
					});
				} else {
					$scope.issecurityGroup = false;
				}
			}
		});
	};
	//从可用区数据中处理网络类型数据
	var checktype = function (type) {
		var name;
		if (type == 'vpc') name = '专有网络';
		if (type == 'classic') name = '经典网络';
		return name;
	};
	var handleNetworkType = function (resources) {
		if (resources.length > 0) {
			$scope.networkTypeData = [];
			var type;
			var type2 = '';
			for (var i = 0; i < resources.length; i++) {
				if (i == 0) {
					type = resources[i].networkTypes[0];
					$scope.networkTypeData.push({"value": type, "name": checktype(type), "isNetworkTypeActive": true});
				} else {
					if (resources[i].networkTypes[0] != type) {
						type2 = resources[i].networkTypes[0];
						$scope.networkTypeData.push({"value": type2, "name": checktype(type2), "isNetworkTypeActive": false});
						break;
					}
				}
			}
			if (type == 'classic') {
				$scope.isProprietary = false;
				$scope.issecurityGroup = false;
				$scope.getSecurityData();
			} else if (type == 'vpc') {
				$scope.isProprietary = true;
				$scope.issecurityGroup = false;
			}
		}
	};
	//从可用区数据中处理实例系列,实例规格，系统盘数据
	var handleInstance = function (resources) {
		if (resources.length > 0) {
			var arr = [], arr1 = [], arr2 = [], value, value1;
			var a = 0, b = 0, index;
			for (var i = 0; i < resources.length; i++) {
				value1 = resources[i].instanceGenerations[0];
				value = value1.substr(value1.length - 1, 1);
				arr.push(parseInt(value));
			}
			for (var j = 0; j < arr.length; j++) {
				if (j == 0) arr1.push(arr[0]);
				var arr3 = [];
				for (var k = 0; k < arr1.length; k++) {
					if (arr1[k] > arr[j]) a = 1;
					if (arr1[k] < arr[j]) {
						b = 1;
						arr3.push(k);
					}
					if (arr1[k] == arr[j]) {
						b = 2;
					}
				}
				if (a == 1 && b == 0) {
					//比arr1中任何一个值都小
					arr1.splice(0, 0, arr[j]);
				} else if (a == 1 && b == 1) {
					//在arr1中间的值
					arr1.splice(arr3[0], 0, arr[j]);
				} else if (a == 0 && b == 1) {
					//比arr1中任何一个值都大
					arr1.push(arr[j]);
				}
			}
			//实例数据
			$scope.IOTypeData = [];
			for (var m = 0; m < arr1.length; m++) {
				if (m == 0) $scope.IOTypeData.push({"value": "ecs-" + arr1[0], "name": "系列" + arr1[0], "isIOTypeActive": true});
				else $scope.IOTypeData.push({"value": "ecs-" + arr1[m], "name": "系列" + arr1[m], "isIOTypeActive": false});
			}
			//默认选择了第一个实例系列
			var queryInstanceData1 = [], queryInstanceData2 = [];
			angular.forEach(resources, function (data, index) {
				//默认选中对应系列的数据
				if (data.instanceGenerations[0] == $scope.IOTypeData[0].value) {
					queryInstanceData1.push(data);
				}
			});
			angular.forEach(queryInstanceData1, function (data, index) {
				//默认选中对应系列的数据中，没有IO优化的数据
				if (data.ioOptimized == $scope.isIOselected) {
					queryInstanceData2.push(data);
				}
			});
			var loadInstanceData;
			angular.forEach(queryInstanceData2, function (data1, index1) {
				angular.forEach(data1.instanceTypes, function (data2, index2) {
					loadInstanceData = loadInstanceData + ',' + data2;
				});
			});
			loadInstanceData = loadInstanceData.substr(1);
			//获取实例规格数据（接口未知）
			httpLoad.loadData({
				url: '/zone/list',
				method: 'POST',
				data: {"instanceTypes": loadInstanceData},
				success: function (data) {
					if (data.success) {
						$scope.sizeData = data.data;
					}
				}
			});
			//系统盘数据
			angular.forEach(queryInstanceData2, function (data, index) {
				angular.forEach(data.systemDiskCategories, function (item, i) {
					if (item == "cloud_efficiency") {
						$scope.systemDiskData.push({"value": "EFFICIENCY", "name": "高效云盘"});
					}
					if (item == "cloud_ssd") {
						$scope.systemDiskData.push({"value": "SSD", "name": "SSD云盘"});
					}
					if (item == "cloud") {
						$scope.systemDiskData.push({"value": "CLOUD", "name": "普通云盘"});
					}
				});
			});
			angular.forEach($scope.systemDiskData, function (data, index) {
				//默认选中第一个系统盘
				if (index == 0) $scope.systemDiskValue = data.value;
			});
			//数据盘数据
			angular.forEach(queryInstanceData2, function (data, index) {
				angular.forEach(data.dataDiskCategories, function (item, i) {
					if (item == "cloud_efficiency") {
						$scope.dataDiskData.push({"value": "EFFICIENCY", "name": "高效云盘"});
					}
					if (item == "cloud_ssd") {
						$scope.dataDiskData.push({"value": "SSD", "name": "SSD云盘"});
					}
					if (item == "cloud") {
						$scope.dataDiskData.push({"value": "CLOUD", "name": "普通云盘"});
					}
				});
			});
			angular.forEach($scope.dataDiskData, function (data, index) {
				//默认选中第一个数据盘
				if (index == 0) $scope.dataDiskValue = data.value;
			});
			console.log($scope.dataDiskData);
		}
	};
	//获取可用区数据
	$scope.getAvailableRegion = function (regionId) {
		httpLoad.loadData({
			url: '/zone/list',
			method: 'POST',
			data: {
				simple: true,
				params:[{param:{"regionId": regionId},sign:'EQ'}]
			},
			noParam: true,
			success: function (data) {
				if (data.success) {
					$scope.availableRegion = data.data.rows;
					angular.forEach($scope.availableRegion, function (data, index) {
						//默认选中第一个可用区
						if (index == 0) {
							$scope.addData.zone = data.id;
							$scope.resources = data.resources;
						}
					});
					//从可用区数据中处理网络类型数据
					// handleNetworkType($scope.resources);
					//从可用区数据中处理实例系列数据
					// handleInstance($scope.resources);
				}
			}
		});
	};
	//网络类型数据
	//$scope.networkTypeData = [{"value":"CLASSICAL","name":"经典网络","isNetworkTypeActive":true},{"value":"PROPRIETARY","name":"专有网络","isNetworkTypeActive":false}];
	//$scope.isProprietary = false;$scope.issecurityGroup = false;
	//选择网络类型
	$scope.chooseNetworkType = function (item) {
		angular.forEach($scope.networkTypeData, function (data, index) {
			data.isNetworkTypeActive = false;
			if (data.value == item.value) {
				data.isNetworkTypeActive = !item.isNetworkTypeActive;
			}
			if (data.isNetworkTypeActive) {
				if (item.name == '经典网络') {
					$scope.addData.networkType = item.value;
					$scope.isProprietary = false;
					if (!$scope.securityList) $scope.getSecurityData();
				} else {
					$scope.issecurityGroup = false;
					$scope.isProprietary = true;
				}
			}
		});
	};
	//实例数据
	//$scope.IOTypeData = [{"value":"","name":"系列1","isIOTypeActive":true},{"value":"","name":"系列2","isIOTypeActive":false}];
	$scope.isIOselected = false;
	//选择IO优化
	$scope.selectItem = function () {
		if ($scope.isIOselected == true) {
			angular.forEach($scope.IOTypeData, function (data, index) {
				if (data.isIOTypeActive) {
					var queryInstanceData1 = [], queryInstanceData2 = [];
					angular.forEach($scope.resources, function (data, index) {
						//默认选中对应系列的数据
						if (data.instanceGenerations[0] == item.value) {
							queryInstanceData1.push(data);
						}
					});
					angular.forEach(queryInstanceData1, function (data, index) {
						if (data.ioOptimized == $scope.isIOselected) {
							queryInstanceData2.push(data);
						}
					});
					var loadInstanceData;
					angular.forEach(queryInstanceData2, function (data1, index1) {
						angular.forEach(data1.instanceTypes, function (data2, index2) {
							loadInstanceData = loadInstanceData + ',' + data2;
						});
					});
					loadInstanceData = loadInstanceData.substr(1);
					//获取实例规格数据（接口未知）
					httpLoad.loadData({
						url: '/zone/list',
						method: 'POST',
						data: {"instanceTypes": loadInstanceData},
						success: function (data) {
							if (data.success) {
								$scope.sizeData = data.data;
							}
						}
					});
					//系统盘数据
					angular.forEach(queryInstanceData2, function (data, index) {
						angular.forEach(data.systemDiskCategories, function (item, i) {
							if (item == "cloud_efficiency") {
								$scope.systemDiskData.push({"value": "EFFICIENCY", "name": "高效云盘"});
							}
							if (item == "cloud_ssd") {
								$scope.systemDiskData.push({"value": "SSD", "name": "SSD云盘"});
							}
							if (item == "cloud") {
								$scope.systemDiskData.push({"value": "CLOUD", "name": "普通云盘"});
							}
						});
					});
					angular.forEach($scope.systemDiskData, function (data, index) {
						//默认选中第一个系统盘
						if (index == 0) $scope.systemDiskValue = data.value;
					});
					//数据盘数据
					angular.forEach(queryInstanceData2, function (data, index) {
						angular.forEach(data.dataDiskCategories, function (item, i) {
							if (item == "cloud_efficiency") {
								$scope.dataDiskData.push({"value": "EFFICIENCY", "name": "高效云盘"});
							}
							if (item == "cloud_ssd") {
								$scope.dataDiskData.push({"value": "SSD", "name": "SSD云盘"});
							}
							if (item == "cloud") {
								$scope.dataDiskData.push({"value": "CLOUD", "name": "普通云盘"});
							}
						});
					});
					angular.forEach($scope.dataDiskData, function (data, index) {
						//默认选中第一个数据盘
						if (index == 0) $scope.dataDiskValue = data.value;
					});
				}
			});
		} else return;
	};
	//选择实例规格
	$scope.chooseIOType = function (item) {
		angular.forEach($scope.IOTypeData, function (data, index) {
			data.isIOTypeActive = false;
			if (data.name == item.name) {
				data.isIOTypeActive = !item.isIOTypeActive;
			}
			if (data.isIOTypeActive) {
				var queryInstanceData1 = [], queryInstanceData2 = [];
				angular.forEach($scope.resources, function (data, index) {
					//默认选中对应系列的数据
					if (data.instanceGenerations[0] == item.value) {
						queryInstanceData1.push(data);
					}
				});
				angular.forEach(queryInstanceData1, function (data, index) {
					if (data.ioOptimized == $scope.isIOselected) {
						queryInstanceData2.push(data);
					}
				});
				var loadInstanceData;
				angular.forEach(queryInstanceData2, function (data1, index1) {
					angular.forEach(data1.instanceTypes, function (data2, index2) {
						loadInstanceData = loadInstanceData + ',' + data2;
					});
				});
				loadInstanceData = loadInstanceData.substr(1);
				//获取实例规格数据（接口未知）
				httpLoad.loadData({
					url: '/zone/list',
					method: 'POST',
					data: {"instanceTypes": loadInstanceData},
					success: function (data) {
						if (data.success) {
							$scope.sizeData = data.data;
						}
					}
				});
				//系统盘数据
				angular.forEach(queryInstanceData2, function (data, index) {
					angular.forEach(data.systemDiskCategories, function (item, i) {
						if (item == "cloud_efficiency") {
							$scope.systemDiskData.push({"value": "EFFICIENCY", "name": "高效云盘"});
						}
						if (item == "cloud_ssd") {
							$scope.systemDiskData.push({"value": "SSD", "name": "SSD云盘"});
						}
						if (item == "cloud") {
							$scope.systemDiskData.push({"value": "CLOUD", "name": "普通云盘"});
						}
					});
				});
				angular.forEach($scope.systemDiskData, function (data, index) {
					//默认选中第一个系统盘
					if (index == 0) $scope.systemDiskValue = data.value;
				});
				//数据盘数据
				angular.forEach(queryInstanceData2, function (data, index) {
					angular.forEach(data.dataDiskCategories, function (item, i) {
						if (item == "cloud_efficiency") {
							$scope.dataDiskData.push({"value": "EFFICIENCY", "name": "高效云盘"});
						}
						if (item == "cloud_ssd") {
							$scope.dataDiskData.push({"value": "SSD", "name": "SSD云盘"});
						}
						if (item == "cloud") {
							$scope.dataDiskData.push({"value": "CLOUD", "name": "普通云盘"});
						}
					});
				});
				angular.forEach($scope.dataDiskData, function (data, index) {
					//默认选中第一个数据盘
					if (index == 0) $scope.dataDiskValue = data.value;
				});
			}
		});
	};
	//选择实例规格
	if ($scope.showAli == 1) {
		angular.forEach($scope.sizeData, function (data, index) {
			if (index == 0) {
				$scope.addData.cpu = data.cpu;
				$scope.addData.memory = data.memory;
			}
		});
	}
	$scope.chooseSize = function () {
		var action = 'Ali';
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/config/vm/size.html',
			controller: 'chooseSizeModalCtrl',
			resolve: {
				action: function () {
					return action;
				},
				sizeData: function () {
					return $scope.sizeData;
				}
			}
		});
		modalInstance.result.then(function (data) {
			$scope.addData.cpu = data.cpu;
			$scope.addData.memory = data.memory;
		}, function () {
		});
	};
	//带宽
	$scope.bandwidthData = [{"value": "", "name": "按固定带宽", "isBandwidthActive": true}, {
		"value": "",
		"name": "按使用流量",
		"isBandwidthActive": false
	}];
	$scope.bandwidthTitle = '带宽：';
	$scope.addData.internetChargeType = 'PayByBandwidth';
	$scope.bandWidthslider = {
		value: 1,
		options: {
			showTicks: false,
			floor: 1,
			ceil: 200,    //阿里云的，如果是按固定带宽，带宽是1M-200M，如果是按使用流量，带宽是1M-100M
			step: 1,
			translate: function (value) {
				return value + 'M';
			},
			onChange: function (sliderId, modelValue, highValue, pointerType) {
				//如果是固定带宽，internetMaxBandwidthIn就是你要的值;如果是按照流量：InternetMaxBandwidthOut就是你要传的值
				if ($scope.addData.internetChargeType == 'PayByBandwidth') {
					$scope.addData.internetMaxBandwidthIn = modelValue;
				}
				if ($scope.addData.internetChargeType == 'PayByTraffic') {
					$scope.addData.InternetMaxBandwidthOut = modelValue;
				}
			}
		}
	};
	//选择带宽
	$scope.chooseBandwidth = function (item) {
		angular.forEach($scope.bandwidthData, function (data, index) {
			data.isBandwidthActive = false;
			if (data.name == item.name) {
				data.isBandwidthActive = !item.isBandwidthActive;
			}
			if (data.isBandwidthActive) {
				//internetChargeType这是一个属性，PayByBandwidth（带宽），PayByTraffic（流量）
				if (item.name == '按固定带宽') {
					$scope.addData.internetChargeType = 'PayByBandwidth';
					$scope.bandwidthTitle = '带宽：';
					$scope.bandWidthslider.value = 1;
					$scope.bandWidthslider.options.floor = 1;
					$scope.bandWidthslider.options.ceil = 200;
				} else {
					$scope.addData.internetChargeType = 'PayByTraffic';
					$scope.bandwidthTitle = '带宽峰值：';
					$scope.bandWidthslider.value = 5;
					$scope.bandWidthslider.options.floor = 1;
					$scope.bandWidthslider.options.ceil = 100;
				}
			}
		});
	};
	//获取镜像名称数据
	$scope.isImageVersion = true;
	$scope.getImageNameData = function () {
		httpLoad.loadData({
			url: '/image/listName',
			method: 'POST',
			data: {"id": $stateParams.id, "region": $scope.addData.region},
			success: function (data) {
				if (data.success) {
					$scope.imageNameList = data.data.rows;
				}
			}
		});
	};
	//获取镜像版本数据
	$scope.getImageVersionData = function () {
		httpLoad.loadData({
			url: '/list/listVersion',
			method: 'POST',
			data: {"id": $stateParams.id, "region": $scope.addData.region, "name": $scope.addData.osName},
			success: function (data) {
				if (data.success) {
					$scope.imageVersionList = data.data.rows;
					angular.forEach($scope.imageVersionList, function (data, index) {
						//默认选中第一个
						if (index == 0) $scope.addData.imageId = data.name;
					});
				}
			}
		});
	};
	//选择镜像名称(还没写镜像名称和版本的级联关系)
	$scope.selectImageName = function (name) {
		if (!name || name == "") {
			$scope.isImageVersion = true;
			return;
		}
		$scope.isImageVersion = false;
		$scope.getImageVersionData();
	};
	//选择地域
	$scope.chooseRegion2 = function (item) {
		angular.forEach($scope.regionData, function (data, index) {
			data.isRegionActive = false;
			if (data.id == item.id) {
				data.isRegionActive = !item.isRegionActive;
			}
			if (data.isRegionActive) {
				$scope.addData.region = data.id;
				$scope.resources = data.resources;
				//从可用区数据中处理网络类型数据
				// handleNetworkType($scope.resources);
					$scope.getAvailableRegion(data.regionId);
					$scope.getImageNameData();
			}
		});
	};
	//获取存储系统盘数据
	//$scope.systemDiskData = [{"value":"EFFICIENCY","name":"高效云盘"},{"value":"SSD","name":"SSD云盘"},{"value":"CLOUD","name":"普通云盘"}];
	//$scope.systemDiskValue = "CLOUD";
	$scope.systemDiskData = [];
	$scope.dataDiskData = [];
	$scope.systemDiskNum = 40;
	$scope.systemDiskMin = 40;
	$scope.systemDiskMax = 500;
	$scope.datadiskNum = 4;
	$scope.addData.volumes = [{"type": 'SYSTEM', "category": $scope.systemDiskValue, "size": $scope.systemDiskNum}];
	$scope.selectSystemDiskSize = function () {
		if ($scope.systemDiskNum == "") $scope.systemDiskNum = $scope.systemDiskMin;
		if ($scope.systemDiskNum < $scope.systemDiskMin) $scope.systemDiskNum = $scope.systemDiskMin;
		if ($scope.systemDiskNum > $scope.systemDiskMax) $scope.systemDiskNum = $scope.systemDiskMax;
	};
	//数据盘数据处理
	$scope.diskMin = 5;
	$scope.diskMax = 2000;
	$scope.dataDisk = [];
	$scope.addDataDisk = function () {
		if ($scope.datadiskNum == 0) return;
		angular.forEach($scope.dataDiskData, function (data, index) {
			if (data.value == $scope.dataDiskValue) {
				$scope.dataDiskName = data.name;
				$scope.dataDisk.push({
					"type": 'DATA',
					"name": $scope.dataDiskName,
					"category": $scope.dataDiskValue,
					"size": 5
				});
				$scope.addData.volumes.push({"type": 'DATA', "category": $scope.dataDiskValue, "size": 5});
			}
		});
		$scope.datadiskNum--;
	};
	$scope.deleteDataDisk = function (key) {
		angular.forEach($scope.dataDisk, function (data, index) {
			if (index == key) {
				$scope.dataDisk.splice(key, 1);
				$scope.addData.volumes.splice(key, 1);
			}
		});
		$scope.datadiskNum++;
	};
	$scope.changeDataDisk = function (key, dataDiskValue) {
		angular.forEach($scope.dataDisk, function (data, index) {
			if (index == key) {
				data.category = dataDiskValue;
				$scope.addData.volumes[index].category = dataDiskValue;
				if (dataDiskValue == "cloud_efficiency") {
					data.name = "高效云盘";
					$scope.addData.volumes[index].name = "高效云盘";
				}
				if (dataDiskValue == "cloud_ssd") {
					data.name = "SSD云盘";
					$scope.addData.volumes[index].name = "SSD云盘";
				}
				if (dataDiskValue == "cloud") {
					data.name = "普通云盘";
					$scope.addData.volumes[index].name = "普通云盘";
				}
			}
		});
	};
	//检查数据盘是否在容量范围范围以内（阿里云）
	$scope.checkDiskRange = function (value, key) {
		if (value.size < $scope.diskMin) {
			angular.forEach($scope.dataDisk, function (data, index) {
				if (index == key) {
					data.size = $scope.diskMin;
				}
			});
		}
		if (value.size > $scope.diskMax) {
			angular.forEach($scope.dataDisk, function (data, index) {
				if (index == key) {
					data.size = $scope.diskMax;
				}
			});
		}
	};
	if ($scope.showAli == 1) $scope.getImageNameData(); //获取镜像名称数据
	//检查2次密码是否一致
	$scope.isPasswordSame = function () {
		if (!$scope.addData.password) {
			$scope.pop('请先输入登录密码', 'error');
			return;
		}
		if (!$scope.password2) return;
		if ($scope.addData.password != $scope.password2) {
			$scope.pop('两次输入的密码不一致，请重新输入', 'error');
			return;
		}
	};
	//数量增减
	if ($scope.showAli == 1) $scope.addData.count = 1;
	$scope.overdue = function () {
		if ($scope.addData.count > 1) {
			$scope.addData.count--;
		}
	};
	$scope.add = function () {
		//if($scope.addData.count<250){
		//    $scope.addData.count++;
		//}
	};
	
	$scope.ok = function () {
		//云供应商的ID
		$scope.addData.id = $stateParams.id;
		if (!$scope.addData.region) {
			$scope.pop('请选择地域', 'error');
			return;
		}
		if (!$scope.addData.zone || $scope.addData.zone == "") {
			$scope.pop('请选择可用区', 'error');
			return;
		}
		if (!$scope.addData.osName || $scope.addData.osName == "") {
			$scope.pop('请选择镜像名称', 'error');
			return;
		}
		if (!$scope.addData.imageId || $scope.addData.imageId == "") {
			$scope.pop('请选择镜像版本', 'error');
			return;
		}
		httpLoad.loadData({
			url: '/vm/create',
			method: 'POST',
			data: $scope.addData,
			success: function (data) {
				if (data.success) {
					$scope.pop("虚机添加成功");
					$scope.goBack();
				}
			}
		});
	};
	$scope.cancel = function () {
		$scope.goBack();
	};
}]);
//选择实例规格ctrl
angular.module('app').controller('chooseSizeModalCtrl', ['$rootScope', '$scope', '$modalInstance', 'httpLoad', '$stateParams', 'action',
	function ($rootScope, $scope, $modalInstance, httpLoad, $stateParams, action) { //依赖于modalInstance
		if (action == 'Ali') {
			$scope.sizeData = [{
				"name": 1,
				"size": [{"cpu": 1, "memory": 1, "isSizeActive": true}, {
					"cpu": 1,
					"memory": 2,
					"isSizeActive": false
				}, {"cpu": 1, "memory": 4, "isSizeActive": false}, {"cpu": 1, "memory": 8, "isSizeActive": false}]
			}, {
				"name": 2,
				"size": [{"cpu": 2, "memory": 2, "isSizeActive": false}, {
					"cpu": 2,
					"memory": 4,
					"isSizeActive": false
				}, {"cpu": 2, "memory": 8, "isSizeActive": false}, {"cpu": 2, "memory": 16, "isSizeActive": false}]
			}, {
				"name": 4,
				"size": [{"cpu": 4, "memory": 4, "isSizeActive": false}, {
					"cpu": 4,
					"memory": 8,
					"isSizeActive": false
				}, {"cpu": 4, "memory": 16, "isSizeActive": false}, {"cpu": 4, "memory": 32, "isSizeActive": false}]
			}, {
				"name": 8,
				"size": [{"cpu": 8, "memory": 8, "isSizeActive": false}, {
					"cpu": 8,
					"memory": 16,
					"isSizeActive": false
				}, {"cpu": 8, "memory": 32, "isSizeActive": false}, {"cpu": 8, "memory": 64, "isSizeActive": false}]
			}, {
				"name": 16,
				"size": [{"cpu": 16, "memory": 16, "isSizeActive": false}, {
					"cpu": 16,
					"memory": 32,
					"isSizeActive": false
				}, {"cpu": 16, "memory": 64, "isSizeActive": false}, {"cpu": 16, "memory": 128, "isSizeActive": false}]
			}, {
				"name": 32,
				"size": [{"cpu": 32, "memory": 64, "isSizeActive": false}, {"cpu": 32, "memory": 128, "isSizeActive": false}]
			}, {
				"name": 40,
				"size": [{"cpu": 40, "memory": 224, "isSizeActive": false}]
			}];
		}
		if (action == 'JD') {
			$scope.sizeData = [{
				"name": 1,
				"size": [{"cpu": 1, "memory": 1, "isSizeActive": true}, {
					"cpu": 1,
					"memory": 2,
					"isSizeActive": false
				}, {"cpu": 1, "memory": 4, "isSizeActive": false}, {"cpu": 1, "memory": 8, "isSizeActive": false}]
			}, {
				"name": 2,
				"size": [{"cpu": 2, "memory": 2, "isSizeActive": false}, {
					"cpu": 2,
					"memory": 4,
					"isSizeActive": false
				}, {"cpu": 2, "memory": 8, "isSizeActive": false}, {"cpu": 2, "memory": 12, "isSizeActive": false}]
			}, {
				"name": 4,
				"size": [{"cpu": 4, "memory": 4, "isSizeActive": false}, {
					"cpu": 4,
					"memory": 8,
					"isSizeActive": false
				}, {"cpu": 4, "memory": 12, "isSizeActive": false}, {"cpu": 4, "memory": 16, "isSizeActive": false}]
			}, {
				"name": 8,
				"size": [{"cpu": 8, "memory": 8, "isSizeActive": false}, {
					"cpu": 8,
					"memory": 12,
					"isSizeActive": false
				}, {"cpu": 8, "memory": 16, "isSizeActive": false}, {"cpu": 8, "memory": 32, "isSizeActive": false}]
			}, {
				"name": 16,
				"size": [{"cpu": 16, "memory": 16, "isSizeActive": false}, {
					"cpu": 16,
					"memory": 32,
					"isSizeActive": false
				}, {"cpu": 16, "memory": 64, "isSizeActive": false}]
			}];
		}
		$scope.cpu = 1;
		$scope.memory = 1;
		//选择实例规格
		$scope.chooseSizeData = function (item) {
			angular.forEach($scope.sizeData, function (data1, index1) {
				angular.forEach(data1.size, function (data2, index2) {
					data2.isSizeActive = false;
				});
			});
			angular.forEach($scope.sizeData, function (data1, index1) {
				if (data1.name == item.cpu) {
					angular.forEach(data1.size, function (data2, index2) {
						if (data2.memory == item.memory) {
							data2.isSizeActive = true;
							$scope.cpu = data2.cpu;
							$scope.memory = data2.memory;
							return;
						}
					});
				}
			});
		};
		$scope.ok = function () {
			$modalInstance.close({"cpu": $scope.cpu, "memory": $scope.memory});
		};
		
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel'); // 退出
		}
	}]);
angular.module('app').controller('vmAddJDCtrl', ['$rootScope', '$scope', '$state', 'httpLoad', '$stateParams', '$modal', function ($rootScope, $scope, $state, httpLoad, $stateParams, $modal) {
	$rootScope.link = '/statics/css/user.css';
	//$rootScope.moduleTitle = '资源中心 > 虚机管理';
	//$scope.param = {
	//    rows: 10
	//};
	//$scope.showDetail = 1;
	$scope.step = 1;
	var vmTabvendor = JSON.parse(localStorage.getItem('vmTabvendor'));
	(function () {
		$scope.addData = {};
		$scope.param = {};
		$scope.isselectSize = false;
		//获取地域数据
		$scope.getRegion = function () {
			httpLoad.loadData({
				url: '/region/list',
				method: 'POST',
				data: {"id": $stateParams.id},
				success: function (data) {
					if (data.success) {
						$scope.regionData = data.data;
						angular.forEach($scope.regionData, function (data, index) {
							//默认选中第一个区域
							if (index == 0) {
								data.isRegionActive = true;
								$scope.addData.region = data.id;
								//if($scope.showJD == 1)  $scope.getAvailableRegion(data.regionId);
							}
							else data.isRegionActive = false;
						});
					}
				}
			});
		};
		if ($scope.showJD == 1) $scope.getRegion();
		//获取操作系统数据
		$scope.isImageVersion = true;
		$scope.getImageNameData = function () {
			httpLoad.loadData({
				url: '/image/listName',
				method: 'POST',
				data: {"id": $stateParams.id, "region": $scope.addData.region},
				success: function (data) {
					if (data.success) {
						$scope.imageNameList = data.data.rows;
					}
				}
			});
		};
		if ($scope.showJD == 1) $scope.getImageNameData(); //获取镜像名称数据
		//获取镜像版本数据
		$scope.getImageVersionData = function () {
			httpLoad.loadData({
				url: '/list/listVersion',
				method: 'POST',
				data: {"id": $stateParams.id, "region": $scope.addData.region, "name": $scope.addData.osName},
				success: function (data) {
					if (data.success) {
						$scope.imageVersionList = data.data.rows;
						angular.forEach($scope.imageVersionList, function (data, index) {
							//默认选中第一个
							if (index == 0) $scope.addData.imageId = data.name;
						});
					}
				}
			});
		};
		//选择操作系统
		$scope.selectImageName = function (name) {
			if (!name || name == "") {
				$scope.isImageVersion = true;
				return;
			}
			$scope.isImageVersion = false;
			$scope.getImageVersionData();
		};
		//选择实例规格
		if ($scope.showJD == 1) {
			$scope.addData.cpu = 1;
			$scope.addData.memory = 1;
		}
		$scope.chooseSize = function () {
			var action = 'JD';
			var modalInstance = $modal.open({
				templateUrl: '/statics/tpl/config/vm/size.html',
				controller: 'chooseSizeModalCtrl',
				resolve: {
					action: function () {
						return action;
					}
				}
			});
			modalInstance.result.then(function (data) {
				$scope.addData.cpu = data.cpu;
				$scope.addData.memory = data.memory;
			}, function () {
			});
		};
		//获取存储系统盘数据
		$scope.systemDiskData = [{"value": "EFFICIENCY", "name": "高效云盘"}, {"value": "SSD", "name": "SSD云盘"}];
		$scope.systemDiskValue = "EFFICIENCY";
		$scope.systemDiskNum = 40;
		$scope.systemDiskMin = 40;
		$scope.systemDiskMax = 500;
		$scope.datadiskNum = 4;
		$scope.addData.volumes = [{"type": 'SYSTEM', "category": $scope.systemDiskValue, "size": $scope.systemDiskNum}];
		$scope.changeDataDisk = function () {
			//if($scope.systemDiskName=='CLOUD') $scope.datadiskNum = 4;
			//else $scope.datadiskNum = 4;
		};
		$scope.selectSystemDiskSize = function () {
			if ($scope.systemDiskNum == "") $scope.systemDiskNum = $scope.systemDiskMin;
			if ($scope.systemDiskNum < $scope.systemDiskMin) $scope.systemDiskNum = $scope.systemDiskMin;
			if ($scope.systemDiskNum > $scope.systemDiskMax) $scope.systemDiskNum = $scope.systemDiskMax;
		};
		//数据盘数据处理
		$scope.diskMin = 5;
		$scope.diskMax = 2000;
		$scope.dataDisk = [];
		$scope.addDataDisk = function () {
			if ($scope.datadiskNum == 0) return;
			angular.forEach($scope.systemDiskData, function (data, index) {
				if (data.value == $scope.systemDiskValue) {
					$scope.systemDiskName = data.name;
					$scope.dataDisk.push({
						"type": 'DATA',
						"name": $scope.systemDiskName,
						"category": $scope.systemDiskValue,
						"size": 5
					});
					$scope.addData.volumes.push({"type": 'DATA', "category": $scope.systemDiskValue, "size": 5});
				}
			});
			$scope.datadiskNum--;
		};
		$scope.deleteDataDisk = function ($index) {
			angular.forEach($scope.dataDisk, function (data, index) {
				if (index == $index) {
					$scope.dataDisk.splice($index, 1);
					$scope.addData.volumes.splice($index, 1);
				}
			});
			$scope.datadiskNum++;
		};
		//检查数据盘是否在容量范围范围以内（阿里云）
		$scope.checkDiskRange = function (row, $index) {
			if (row.size < $scope.diskMin) {
				angular.forEach($scope.dataDisk, function (data, index) {
					if (index == $index) {
						row.size = $scope.diskMin;
					}
				});
			}
			if (row.size > $scope.diskMax) {
				angular.forEach($scope.dataDisk, function (data, index) {
					if (index == $index) {
						row.size = $scope.diskMax;
					}
				});
			}
		};
		//step1
		$scope.next1 = function () {
			if (!$scope.addData.region) {
				$scope.pop('请选择地域', 'error');
				return;
			}
			if (!$scope.addData.osName || $scope.addData.osName == "") {
				$scope.pop('请选择镜像名称', 'error');
				return;
			}
			//if(!$scope.addData.imageId||$scope.addData.imageId==""){
			//    $scope.pop('请选择镜像版本','error');
			//    return;
			//}
			$scope.step = 2;
		};
		
		//网络类型数据
		//$scope.networkTypeData = [{"value":"CLASSICAL","name":"经典网络","isNetworkTypeActive":true},{"value":"PROPRIETARY","name":"专有网络","isNetworkTypeActive":false}];
		//获取安全组数据
		$scope.getSecurityData1 = function () {
			var params = {
					"simple": true
				},
				searchParam = [{"param": {"vendorId": vmTabvendor.id}, "sign": "EQ"}];
			params.params = JSON.stringify(searchParam);
			httpLoad.loadData({
				url: '/security/group/list',
				method: 'POST',
				data: params,
				noParam: true,
				success: function (data) {
					if (data.success && data.data.rows && data.data.rows.length != 0) {
						$scope.securityList = data.data.rows;
						angular.forEach($scope.securityList, function (data, index) {
							//默认选中第一个可用区
							if (index == 0) $scope.addData.securityGroupId = data.value;
						});
					}
				}
			});
		};
		if ($scope.showJD == 1)  $scope.getSecurityData1();
		//公网IP
		$scope.addData.isBGP = "true";
		$scope.IPslider = {
			value: 1,
			options: {
				showTicks: false,
				floor: 1,
				ceil: 200,    //阿里云的，如果是按固定带宽，带宽是1M-200M，如果是按使用流量，带宽是1M-100M
				step: 1,
				translate: function (value) {
					return value + 'Mbps';
				},
				onChange: function (sliderId, modelValue, highValue, pointerType) {
					$scope.addData.BGPsize = modelValue;
				}
			}
		};
		//选择地域
		$scope.chooseRegion3 = function (item) {
			angular.forEach($scope.regionData, function (data, index) {
				data.isRegionActive = false;
				if (data.id == item.id) {
					data.isRegionActive = !item.isRegionActive;
				}
				if (data.isRegionActive) {
					$scope.addData.region = data.id;
				}
			});
		};
		//数量增减
		if ($scope.showJD == 1) $scope.addData.count = 1;
		$scope.overdue = function () {
			if ($scope.addData.count > 1) {
				$scope.addData.count--;
			}
		};
		$scope.add = function () {
			if ($scope.addData.count < 250) {
				$scope.addData.count++;
			}
		};
		
		//step2
		$scope.before = function () {
			$scope.step = 1;
		};
		$scope.next2 = function () {
			//if(!$scope.addData.securityGroupId){
			//    $scope.pop('请选择安全组','error');
			//    return;
			//}
			$scope.step = 3;
		};
		
		
		//检查2次密码是否一致
		$scope.isPasswordSame = function () {
			if (!$scope.addData.password) {
				$scope.pop('请先输入登录密码', 'error');
				return;
			}
			if (!$scope.password2) return;
			if ($scope.addData.password != $scope.password2) {
				$scope.pop('两次输入的密码不一致，请重新输入', 'error');
				return;
			}
		};
		
		$scope.ok = function () {
			//云供应商的ID
			$scope.addData.id = $stateParams.id;
			httpLoad.loadData({
				url: '/vm/create',
				method: 'POST',
				data: $scope.addData,
				success: function (data) {
					if (data.success) {
						$scope.pop("虚机添加成功");
						$scope.goBack();
					}
				}
			});
		};
		$scope.cancel = function () {
			$scope.goBack();
		};
	})();
}]);


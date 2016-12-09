app.controller('AlarmStrategyAddCtrl', ['$rootScope', '$scope', '$modal', 'httpLoad', '$state', '$stateParams', '$timeout', 'LANGUAGE', 'CommonData', function($rootScope, $scope, $modal, httpLoad, $state, $stateParams, $timeout, LANGUAGE, CommonData) {
	$rootScope.moduleTitle = '监控中心 > 新增告警策略';
	$rootScope.link = '/statics/css/alarm.css';//引入页面样式
	$scope.signData = CommonData.signData;
	$scope.fnData = CommonData.fnData;
	$scope.slider = {
		options: {
			floor:0,
			ceil:100
		}
	};
	var measureMap = {};
	var url = '/alarm/strategy/create';
	//如果为编辑，进行赋值
	if($stateParams.id){
		$rootScope.moduleTitle = '监控中心 > 编辑告警策略';
		url = '/alarm/strategy/modify';
		httpLoad.loadData({
			url: '/alarm/strategy/detail',
			method: 'GET',
			data: {id: $stateParams.id},
			success: function(data){
				if(data.success){
					var data = data.data;
					$scope.name = data.name;
					$scope.remark = data.remark;
					$timeout(function () {//延时加载解决sliderbug
						$scope.thresholds = angular.fromJson(data.config);
						$scope.thresholds.forEach(function(item,index){
							$scope.getMeasureItem(item,index,1);
						});
					});
				}
			}
		});
	}
	//获取监控项列表
	(function(){
		httpLoad.loadData({
			url: '/measure/list',
			noParam: true,
			data: {
				simple:true
			},
			success: function(data){
				if(data.success){
					$scope.measurementData = data.data.rows;
					$scope.measurementData.forEach(function (item) {
						measureMap[item.value] = item.id;
					})
				}
			}
		});
	})();
	$scope.thresholds = [{fn:'MIN',period:120}];
	//选择策略项进行验证
	var changeGroup = function(value,key){
		if(!value) return;
		 $scope.thresholds.forEach(function(item,index){
			if(item.measurement == value && index != key){
				$scope.pop('已有此策略项，请勿重新选择','error');
				$scope.thresholds[key].measurement = value = '';
				return false;
			}
		})
		return value;
	};
	//获取监控子项
	$scope.getMeasureItem = function (row, key,flag) {//flag区分是否编辑的数据加载
		if(!flag) row.thresholds = [];
		if(!changeGroup(row.measurement, key)) return;
		httpLoad.loadData({
			url: '/measure/item/list',
			noParam: true,
			data: {
				simple: true,
				params: angular.toJson([{param: {measureId: measureMap[row.measurement]}, sign: 'EQ'}])
			},
			success: function (data) {
				if (data.success) {
					row.measureItemData = data.data.rows;
					if(!flag){
						if (row.measureItemData.length == 0) return $scope.pop('监控项不包含监控子项', 'error');
						row.measureItemData.forEach(function (item) {
							row.thresholds.push({remind: 70, warn: 80, danger: 90, sign: '>', instance: item.name})
						});
					}
				}
			}
		});
	};
	//添加子项
	$scope.addItem = function(data){
		if(!data.measurement) return $scope.pop('请选择监控项','error');
		if(data.thresholds.length == data.measureItemData.length) return $scope.pop('监控子项项已达上限【'+data.thresholds.length+'】，无法继续添加','error')
		data.thresholds.push({remind:70,warn:80,danger:90,sign:'>'});
	};
	//删除子项
	$scope.removeItem = function(key,data){
		if(data.length == 1) return $scope.pop('请至少添加一组监控子项','error');
		data.splice(key,1);
	};
	//添加策略项
	$scope.addGroup = function(){
		if($scope.thresholds.length == $scope.measurementData.length) return $scope.pop('策略项已达上限【'+$scope.measurementData.length+'】，无法继续添加','error')
		$scope.thresholds.push({fn:'MIN',period:120});
	};
	//删除策略项
	$scope.removeGroup = function(key,data){
		if(data.length == 1) return $scope.pop('请至少添加一组策略项','error');
		data.splice(key,1);
	};
	//选择子项进行验证
	$scope.changeItem = function(value,data,key){
		data.forEach(function(item,index){
			if(item.instance == value && index != key){
				$scope.pop('已有此子项配置，请勿重新选择','error');
				data[key].instance = '';
				return false;
			}
		})
		
	};
	$scope.save = function(){
		var config = angular.fromJson(angular.toJson($scope.thresholds));//解除数组间的关系，防止污染
		config.forEach(function (item) {
			delete item.measureItemData;
		});
		var param = {
			name:$scope.name,
			remark:$scope.remark,
			config:config
		}
		if($stateParams.id) param.id = $stateParams.id;
		httpLoad.loadData({
			url: url,
			data: param,
			success: function(data){
				if(data.success){
					var popText = LANGUAGE.ALARM.ALARM.ADD_SUCCESS;
					if($stateParams.id) popText = LANGUAGE.ALARM.ALARM.EDIT_SUCCESS;
					$scope.pop(popText);
					$scope.goBack();
				}
			}
		});
	};
	$scope.goBack = function(){
		$state.go('app.alarm.alarm');
	}
}])

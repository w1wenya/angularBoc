app.controller('NetworkCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', '$stateParams', '$state', 'CommonData', function ($rootScope, $scope, httpLoad, $modal, $stateParams, $state,CommonData) {
	$scope.param = {
		page: 1,
		rows: 10
	};
	$scope.typeData = CommonData.networkType;
	//详情机房列表
	if ($stateParams.id) {
		$rootScope.moduleTitle = '资源管理 > 机柜详情';
		$scope.param.params = angular.toJson([{param: {rackId: $stateParams.id}, sign: 'EQ'}])
	}
	//获取
	$scope.getList = function (page) {
		$scope.param.page = page || $scope.param.page;
		httpLoad.loadData({
			url: '/device/network/list',
			data: $scope.param,
			noParam: true,
			success: function (data) {
				if (data.success) {
					$scope.serverListData = data.data.rows;
					$scope.totalCount = data.data.total;
				}
			}
		});
	};
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
			name: $scope.name,
			tenantName:$scope.tenantName
		});
		var param2 = toObjFormat({
			isAllot: $scope.isAllot,
			type:$scope.type
		});
		if ($stateParams.id) {
			param2.rackId = $stateParams.id;
		};
		if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
		if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
		$scope.param = {
			page: 1,
			rows: 10,
			params: angular.toJson(params)
		}
		$scope.getList();
	}
	//重置搜索条件
	$scope.reset = function () {
		var obj = ['name','tenantName','type','isAllot'];
		angular.forEach(obj, function (data) {
			$scope[data] = '';
		})
	};
	//分配
	$scope.allocate = function (id) {
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/assets/infrastructure/allocateModal.html',
			controller: 'allocateModalCtrl',
			backdrop: 'static',
			size:'lg'
		});
		modalInstance.result.then(function (data) {
			data.id = id;
			httpLoad.loadData({
				url: '/device/network/allot',
				data: data,
				success: function(data){
					if(data.success){
						$scope.pop('资源分配成功');
						$scope.getList();
					}
				}
			});
		});
	};
	//回收
	$scope.recover = function(id){
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/operation/newtask/delModal.html',
			controller: 'delModalCtrl',
			backdrop: 'static',
			resolve:{
				tip: function () {
					return '你确定要回收该资源吗？';
				},
				btnList: function () {
					return  [{name:'回收',type:'btn-danger'},{name:'取消',type:'btn-default'}];
				}
			}
		});
		modalInstance.result.then(function() {
			httpLoad.loadData({
				url: '/device/network/invoke',
				data: {id:id},
				success: function(data){
					if(data.success){
						$scope.pop('资源回收成功');
						$scope.getList();
					}
				}
			});
		});
	};
	//删除
	$scope.delServer = function (id) {
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/assets/infrastructure/network/delModal.html',
			controller: 'delNetworkModalCtrl',
			backdrop: 'static',
			resolve: {
				id: function () {
					return id;
				}
			}
		});
		modalInstance.result.then(function () {
			$scope.getList();
		});
	};
	$scope.goAction = function (flag,id) {
		if($stateParams.id && (flag == 1 || flag == 2)){//从机柜详情跳入添加编辑
			if(flag == 1) id = $stateParams.id;
			$state.go('app.assets.addnetwork', {flag:flag+3,id: id})
		}else $state.go('app.assets.addnetwork', {flag:flag,id: id})
	};
}])
//删除
app.controller('delNetworkModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'LANGUAGE', 'id',
	function ($scope, $modalInstance, httpLoad, LANGUAGE, id) {
		$scope.ok = function () {
			httpLoad.loadData({
				url: '/device/network/remove',
				data: {id: id},
				success: function (data) {
					if (data.success) {
						$scope.pop('网络设备删除成功');
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
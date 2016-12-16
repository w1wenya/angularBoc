app.controller('InfrastructureCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', '$stateParams', '$state', function ($rootScope, $scope, httpLoad, $modal, $stateParams, $state) {
	$rootScope.moduleTitle = '资源管理 > 基础设施';
	$rootScope.link = '/statics/css/tpl-card.css';
	var flag = sessionStorage.getItem('tabLocation')||1;
	switch (flag/1){
		case 1:
			$scope.isHost = true;
			break;
		case 2:
			$scope.isNetwork = true;
			break;
		case 3:
			$scope.isStorage = true;
			break;
	}
	sessionStorage.setItem('tabLocation','1');
}]);
app.filter('infrastructure',function(){
	return function (value, opt) {
		var cnData = {
			networkType:{
				SWITCH:'交换机',
				LB:'负载均衡',
				ROUTER:'路由器'
			},
			yes:{
				true:'否',
				false:'是'
			}
		};
		return cnData[opt][value];
	}
});
app.controller('ServerCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', '$stateParams', '$state', 'CommonData', function ($rootScope, $scope, httpLoad, $modal, $stateParams, $state,CommonData) {
	$scope.typeData = CommonData.hostType;
	$scope.param = {
		page: 1,
		rows: 10
	};
	//详情机房列表
	if ($stateParams.id) {
		$rootScope.moduleTitle = '资源管理 > 机柜详情';
		$scope.param.params = angular.toJson([{param: {rackId: $stateParams.id}, sign: 'EQ'}])
	}
	//获取服务器列表数据
	$scope.getList = function (page) {
		$scope.param.page = page || $scope.param.page;
		httpLoad.loadData({
			url: '/server/list',
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
			tenantName:$scope.tenantName,
			managerIp:$scope.managerIp
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
		var obj = ['name','tenantName','type','isAllot','managerIp'];
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
			// size:'lg'
		});
		modalInstance.result.then(function (data) {
			data.id = id;
			httpLoad.loadData({
				url: '/server/allot',
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
				url: '/server/invoke',
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
			templateUrl: '/statics/tpl/assets/infrastructure/server/delModal.html',
			controller: 'delServerModalCtrl',
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
	//跳转
	$scope.goAction = function (flag,id) {
		if($stateParams.id && (flag == 1 || flag == 2)){
			if(flag == 1) id = $stateParams.id;
			$state.go('app.assets.addserver', {flag:flag+3,id: id})
		}else $state.go('app.assets.addserver', {flag:flag,id: id})
	};
	$scope.goMonitor = function ($event, id) {
		$event.stopPropagation();
		$state.go('app.monitor.serverMonitor', {id: id})
	};
}])
//删除
app.controller('delServerModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'LANGUAGE', 'id',
	function ($scope, $modalInstance, httpLoad, LANGUAGE, id) {
		$scope.ok = function () {
			httpLoad.loadData({
				url: '/server/remove',
				data: {id: id},
				success: function (data) {
					if (data.success) {
						$scope.pop(LANGUAGE.ASSETS.SERVER.DEL_SUCCESS);
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
//选择服务器ctrl
app.controller('allocateModalCtrl', ['$scope', 'httpLoad', '$modalInstance',
	function($scope, httpLoad, $modalInstance) {
		$scope.param = {
			page: 1,
			rows: 10
		}
		$scope.getList = function(page){
			$scope.param.page = page || $scope.param.page;
			$scope.isSelectAll = false;
			httpLoad.loadData({
				url:'/tenant/list',
				method:'POST',
				noParam: true,
				data:$scope.param,
				success:function(data){
					if(data.success){
						$scope.listData = data.data.rows;
						$scope.totalPage = data.data.total;
					}
				}
			});
		}
		$scope.getList();
		//选择一个
		$scope.selectItem = function ($event,row) {
			$event.stopPropagation();
			$event.preventDefault();
			if(row.isSelected){
				row.isSelected = !row.isSelected;
			}else{
				$scope.listData.forEach(function (item) {
					item.isSelected = false;
				});
				row.isSelected = !row.isSelected;
			}
		}
		//对参数进行处理，去除空参数
		var toObjFormat = function(obj) {
			for (var a in obj) {
				if (obj[a] == "") delete obj[a];
			}
			return obj;
		};
		//搜索
		$scope.search = function(){
			var params = [];
			var param1 = toObjFormat({
				name:$scope.name,
			});
			if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson(params)
			}
			$scope.getList(1)
		}
		var toFormatTime = function(time, place) {
			if (!time) return "";
			var date = time.split(' - ');
			return date[place/1];
		}
		$scope.ok = function () {
			$scope.listData.forEach(function (item) {
				if(item.isSelected){
					if(!item.date) return $scope.pop('请选择服务时间','error');
					var obj = {
						id:item.id,
						startTime:toFormatTime(item.date, 0),
						endTime:toFormatTime($scope.date, 1)
					};
					$modalInstance.close(obj);
				}
			});
		}
		$scope.cancle = function () {
			$modalInstance.dismiss('cancel');
		};
	}
])
app.controller('DataBasePhysisCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', '$stateParams', '$state', 'CommonData', function ($rootScope, $scope, httpLoad, $modal, $stateParams, $state,CommonData) {
	$scope.typeData = CommonData.dbType;
	$scope.param = {
		page: 1,
		rows: 10
	};
	//获取
	$scope.getList = function (page) {
		$scope.param.page = page || $scope.param.page;
		httpLoad.loadData({
			url: '/pdb/list',
			data: $scope.param,
			noParam: true,
			success: function (data) {
				if (data.success) {
					$scope.listData = data.data.rows;
					$scope.totalCount = data.data.total;
				}
			}
		});
	};
	$scope.selectTab = function(){
		$scope.getList();
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
			// size:'lg'
		});
		modalInstance.result.then(function (data) {
			data.id = id;
			httpLoad.loadData({
				url: '/pdb/allot',
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
				url: '/pdb/invoke',
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
	$scope.start = function(id){
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/operation/newtask/delModal.html',
			controller: 'delModalCtrl',
			backdrop: 'static',
			resolve:{
				tip: function () {
					return '你确定要启动该数据库吗？';
				},
				btnList: function () {
					return  [{name:'启动',type:'btn-primary'},{name:'取消',type:'btn-default'}];
				}
			}
		});
		modalInstance.result.then(function() {
			httpLoad.loadData({
				url: '/pdb/start',
				data: {id:id},
				success: function(data){
					if(data.success){
						$scope.pop('数据库启动成功成功');
						$scope.getList();
					}
				}
			});
		});
	};
	$scope.stop = function(id){
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/operation/newtask/delModal.html',
			controller: 'delModalCtrl',
			backdrop: 'static',
			resolve:{
				tip: function () {
					return '你确定要停止该数据库吗？';
				},
				btnList: function () {
					return  [{name:'停止',type:'btn-danger'},{name:'取消',type:'btn-default'}];
				}
			}
		});
		modalInstance.result.then(function() {
			httpLoad.loadData({
				url: '/pdb/stop',
				data: {id:id},
				success: function(data){
					if(data.success){
						$scope.pop('数据库停止成功');
						$scope.getList();
					}
				}
			});
		});
	};
	//删除
	$scope.del = function (id) {
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/operation/newtask/delModal.html',
			controller: 'delModalCtrl',
			backdrop: 'static',
			resolve:{
				tip: function () {
					return '你确定要删除该资源吗？';
				},
				btnList: function () {
					return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
				}
			}
		});
		modalInstance.result.then(function () {
			httpLoad.loadData({
				url: '/pdb/remove',
				data: {id: id},
				success: function (data) {
					if (data.success) {
						$scope.pop('数据库删除成功');
						$scope.getList();
					}
				}
			});
		});
	};
	//跳转
	$scope.goAction = function (flag,id) {
		$state.go('app.assets.addphysisdb', {flag:flag,id: id})
	};
	$scope.goMonitor = function ($event, id) {
		$event.stopPropagation();
		$state.go('app.monitor.serverMonitor', {id: id})
	};
}])
//选择服务器
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
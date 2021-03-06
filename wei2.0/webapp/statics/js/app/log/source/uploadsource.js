app.controller('LogSourceUploadCtrl', ['$rootScope', '$scope', '$modal', 'httpLoad', '$state', '$stateParams','LANGUAGE',function($rootScope, $scope, $modal, httpLoad, $state, $stateParams, LANGUAGE) {
	$rootScope.moduleTitle = '日志中心 > 数据源下发';
	$rootScope.link = '/statics/css/monitor.css';//引入页面样式
	//生成默认名称
	var createDefaultName =  function(){
		//对时间进行格式化
		var format = function(value){
			if(value/1 < 10) value = '0' + value;
			return value;
		}
		var date = new Date();
		$scope.name = '数据源-' + $scope.detailData.name + date.getFullYear() + format(date.getMonth()+1) + format(date.getDate()) + format(date.getHours()) + format(date.getMinutes()) + format(date.getSeconds());
	};
	$scope.settingList = [];
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/logsource/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.detailData = data.data;
					createDefaultName();
					var obj = angular.fromJson($scope.detailData.config);
					obj.filter = obj.filter || {};
					$scope.inputListData = obj.input;
					$scope.filterValue = obj.filter.value;
					$scope.filterListData = obj.filter.configs;
				}
			}
		});
		//获取执行账户列表
		httpLoad.loadData({
			url: '/ident/list',
			noParam: true,
			data: {
				simple: true
			},
			success: function (data) {
				if (data.success) {
					$scope.accountData = data.data.rows;
					for (var a in $scope.accountData) {
						var data = $scope.accountData[a];
						data.name = data.username;
						if (data.remark) {
							data.name = data.username + '(' + data.remark + ')';
						}
					}
				}
			}
		});
	})();
	//选择服务器
	$scope.selectServer = function () {
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/operation/newtask/selectServerModal.html',
			controller: 'selectServerModalCtrl',
			backdrop: 'static',
			size:'lg',
			resolve: {
				selectList:function(){
					return angular.toJson($scope.serverListData || []);
				}
			}
		});
		modalInstance.result.then(function (data) {
			$scope.serverListData = data;
			if (data.length > 0) $scope.isShowServer = true;
			$scope.totalSelect = $scope.serverListData.length;
		});
	};
	//删除选择的服务器
	$scope.delServer = function (key) {
		$scope.serverListData.splice(key, 1);
		$scope.totalSelect = $scope.serverListData.length;
	}
	$scope.save = function(){
		var ipList = [];
		for(var a in $scope.serverListData){
			var data = $scope.serverListData[a];
			ipList.push({id:data.id,ip:data.ip})
		}
		if(ipList.length == 0) return $scope.pop('请选择目标机器','error');
		var postData = {
			id:$stateParams.id,
			name: $scope.name,
			identId: $scope.identId,
			targets:ipList,
			type:'CONFIG'
		}
		httpLoad.loadData({
			url: '/logsource/upload',
			method: 'POST',
			data: postData,
			success: function(data){
				if(data.success){
					$scope.pop('下发成功');
					$scope.goBack();
				}
			}
		});
	};
	$scope.goBack = function(){
		$state.go('app.log.source');
	}
}])

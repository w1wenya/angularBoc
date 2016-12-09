app.controller('AlarmStrategyUploadCtrl', ['$rootScope', '$scope', '$modal', 'httpLoad', '$state', '$stateParams','LANGUAGE',function($rootScope, $scope, $modal, httpLoad, $state, $stateParams, LANGUAGE) {
	$rootScope.moduleTitle = '监控中心 > 告警策略下发';
	$rootScope.link = '/statics/css/monitor.css';//引入页面样式
	//生成默认名称
	var createDefaultName =  function(){
		//对时间进行格式化
		var format = function(value){
			if(value/1 < 10) value = '0' + value;
			return value;
		}
		var date = new Date();
		$scope.name = '告警策略-' + $scope.detailData.name + date.getFullYear() + format(date.getMonth()+1) + format(date.getDate()) + format(date.getHours()) + format(date.getMinutes()) + format(date.getSeconds());
	};
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/alarm/strategy/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.detailData = data.data;
					createDefaultName();
					$scope.thresholds = angular.fromJson(data.data.thresholds);
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
			url: '/alarm/strategy/upload',
			method: 'POST',
			data: postData,
			success: function(data){
				if(data.success){
					$scope.pop('策略下发成功');
					$state.go('app.alarm.alarm');
				}
			}
		});
	};
	$scope.goBack = function(){
		$state.go('app.alarm.alarm');
	}
}])

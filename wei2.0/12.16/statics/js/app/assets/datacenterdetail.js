app.controller('DataCenterDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '资源管理 > 数据中心详情';
	$rootScope.link = '/statics/css/tpl-card.css';
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/dc/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.centerDetail = data.data;
				}
			}
		});
		httpLoad.loadData({
			url: '/dc/alarms',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.alarmData = data.data.rows;
				}
			}
		});
	})()
	$scope.goDetail = function(id){
		$state.go('app.assets.addserver', {flag:3,id: id});
	}
	$scope.goBack = function(){
		history.back();
	}
}])
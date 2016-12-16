app.controller('RackDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '资源管理 > 机柜详情';
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/rack/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.rackDetail = data.data;
				}
			}
		});
		httpLoad.loadData({
			url: '/rack/alarms',
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

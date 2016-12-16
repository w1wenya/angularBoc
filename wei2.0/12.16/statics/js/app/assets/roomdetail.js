app.controller('RoomDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '资源管理 > 机房详情';
	
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/room/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.roomDetail = data.data;
				}
			}
		});
		httpLoad.loadData({
			url: '/room/alarms',
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

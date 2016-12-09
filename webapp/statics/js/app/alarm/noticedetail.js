app.controller('NoticeDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '告警中心 > 通知策略详情';
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/notice/strategy/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.detailData = data.data;
				}
			}
		});
		httpLoad.loadData({
			url: '/rack/alarms',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.personData = data.data.rows;
				}
			}
		});
	})()
	$scope.goBack = function(){
		$state.go('app.alarm.notice');
	}
}])

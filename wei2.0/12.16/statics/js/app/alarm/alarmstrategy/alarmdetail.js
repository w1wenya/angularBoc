app.controller('AlarmDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '参数管理 > 告警策略详情';
	$rootScope.link = '/statics/css/alarm.css';//引入页面样式
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/alarm/strategy/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.detailData = data.data;
					$scope.thresholds = angular.fromJson(data.data.config);
				}
			}
		});
	})();
	$scope.goBack = function(){
		$state.go('app.config.alarm');
	}
}])

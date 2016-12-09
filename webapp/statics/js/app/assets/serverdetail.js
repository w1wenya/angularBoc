app.controller('ServerDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '资源中心 > 设备详情';
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/server/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.serverDetail = data.data;
				}
			}
		});
	})()
	$scope.goBack = function(){
		history.back();
	}
}])

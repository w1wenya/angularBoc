app.controller('ApplicationDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '应用中心 > 应用详情';
	
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/app/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.detailData = data.data;
				}
			}
		});
	})();
	$scope.goDetail = function(){
		$state.go('app.assets.serverdetail', {id: id});
	}
	$scope.goBack = function(){
		$state.go('app.application.manage');
	}
}])

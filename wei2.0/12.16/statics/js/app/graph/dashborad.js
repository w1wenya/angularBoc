app.controller('DashboradGraphCtrl', ['$rootScope', '$scope', 'httpLoad',function($rootScope, $scope, httpLoad) {
	$rootScope.moduleTitle = '数据纵览 > Dashboard';
	$rootScope.link = '/statics/css/graph.css';
	var map = {
		CONFIRMED:'已确认',
		UNCONFIRMED:'未确认',
		SOLVED:'已解决'
	}
	httpLoad.loadData({
			url: '/stats/dashboard',
			method: 'GET',
		  noParam:true,
			success: function(data){
				if(data.success) {
					$scope.isDataLoad = true;
					$scope.dashboradData = data.data;
					//数据装换
					$scope.dashboradData.alarms.forEach(function (item) {
						item.name = map[item.name];
					});
				}
			}
		});
}]);
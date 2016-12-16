app.controller('InfrastructureGraphCtrl', ['$rootScope', '$scope', 'httpLoad',function($rootScope, $scope, httpLoad) {
	$rootScope.moduleTitle = '数据纵览 > 基础设施';
	$rootScope.link = '/statics/css/graph.css';
	httpLoad.loadData({
			url: '/statics/api/graph/dashborad.json',
			method: 'GET',
		  noParam:true,
			success: function(data){
				if(data.success) {
					$scope.isDataLoad = true;
					$scope.dashboradData = data.data;
				}
			}
		});
}]);

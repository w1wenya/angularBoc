app.controller('ApplicationDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '监控管理 > 告警管理';
	$rootScope.link = '/statics/css/alarm.css';//引入页面样式
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/alarm/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.detailData = data.data;
					$scope.historyData=[{date:$scope.detailData.occurred,content:'告警触发',person:'SYSTEM',status:'UNCONFIRMED',select:true},{},{}];
					$scope.col = 12;
					if($scope.detailData.status == 'CONFIRMED'){
						$scope.col = 6;
						$scope.historyData[1] = {date:$scope.detailData.occurred,content:'确认告警',person:$scope.detailData.confirmUser,status:'CONFIRMED',select:true};
					}else if($scope.detailData.status == 'SOLVED'){
						$scope.col = 4;
						$scope.historyData[1] = {date:$scope.detailData.gmtConfirm,content:'确认告警',person:$scope.detailData.confirmUser,status:'CONFIRMED',select:true};
						$scope.historyData[2] = {date:$scope.detailData.gmtSolve,content:'解决告警',person:$scope.detailData.solveUser,status:'SOLVED',select:true};
						
					}
				}
			}
		});
	})();
	$scope.goBack = function(){
		$state.go('app.monitor.manage');
	}
}])

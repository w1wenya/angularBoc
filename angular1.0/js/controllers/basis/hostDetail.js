materialAdmin.controller('HostDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '基础设施 > 主机管理详情';
    $scope.tabs = [
        {
            title:'Home',
            content:'<div class="row panel pad-10" data-ng-include="'+'/views/basis/host/host.html'+'">'
        },
        {
            title:'Profile',
            content:'Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nulla sit amet est. Praesent ac massa at ligula laoreet iaculis. Vivamus aliquet elit ac nisl. Nulla porta dolor. Cras dapibus. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus.',
        },

    ];
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/host/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.hostDetailData = data.data;
				}
			}
		});

	})()

	$scope.goBack = function(){
		history.back();
	}
}])
app.controller('PluginDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams','LANGUAGE',function($rootScope, $scope, httpLoad, $state, $stateParams, LANGUAGE) {
	$rootScope.moduleTitle = '参数管理 > 插件详情';
	$rootScope.link = '/statics/css/log.css';//引入页面样式
	$scope.settingList = [];
	(function(){
		var id = $stateParams.id;
			httpLoad.loadData({
				url: '/logplugin/detail',
				method: 'GET',
				data: {id: id},
				success: function(data){
					if(data.success){
						var data = data.data;
						$scope.detailData = data;
						$scope.settingList = angular.fromJson(data.config);
					}
				}
			});
	})();
	$scope.goBack = function(){
		$state.go('app.config.plugin');
	}
}])

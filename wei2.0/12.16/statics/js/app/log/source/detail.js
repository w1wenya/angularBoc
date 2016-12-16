app.controller('SourceDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams','LANGUAGE',function($rootScope, $scope, httpLoad, $state, $stateParams, LANGUAGE) {
	$rootScope.moduleTitle = '参数管理> 日志配置详情';
	$rootScope.link = '/statics/css/log.css';//引入页面样式
	$scope.settingList = [];
	//获取插件列表
	(function () {
		httpLoad.loadData({
			url:'/logplugin/list',
			method:'POST',
			noParam: true,
			data:{
				simple:true
			},
			success:function(data){
				if(data.success){
					$scope.pluginData = data.data.rows;
				}
			}
		});
	})();
	(function(){
		var id = $stateParams.id;
			httpLoad.loadData({
				url: '/logsource/detail',
				method: 'GET',
				data: {id: id},
				success: function(data){
					if(data.success){
						var data = data.data;
						$scope.detailData = data;
						var obj = angular.fromJson(data.config);
						obj.filter = obj.filter || {};
						$scope.inputListData = obj.input;
						$scope.filterValue = obj.filter.value;
						$scope.filterListData = obj.filter.configs;
					}
				}
			});
	})();
	$scope.goBack = function(){
		$state.go('app.config.source');
	}
}])

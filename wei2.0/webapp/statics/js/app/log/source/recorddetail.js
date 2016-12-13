app.controller('LogSourceRecordDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '日志中心 > 数据源下发记录详情';
	$rootScope.link = '/statics/css/monitor.css';//引入页面样式
	$scope.param = {
		page:1,
		rows:5
	}
	//获取log详情
	$scope.loadDetailLog = function(key,result){
		for(var a in $scope.executeList){
			$scope.executeList[a].isSelect = false;
		}
		$scope.executeList[key].isSelect = true;
		$scope.logDetail = JSON.parse(result);
	}
	$scope.getExecuteList = function(page,status){
		$scope.param.page = page || $scope.param.page;
		$scope.params[0].param.status = status || $scope.params[0].param.status;
		$scope.param.params = JSON.stringify($scope.params);
		httpLoad.loadData({
			url:'/record/results',
			data:$scope.param,
			noParam:true,
			success:function(data){
				if(data.success){
					$scope.executeList = data.data.rows;
					$scope.totalLog = data.data.total;
					$scope.loadDetailLog(0,$scope.executeList[0].result);
				}
			}
		})
	};
	(function(){
		var id = $stateParams.id;
		httpLoad.loadData({
			url: '/logsource/record/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.detailData = data.data;
					var obj = angular.fromJson($scope.detailData.raw);
					obj.filter = obj.filter || {};
					$scope.inputListData = obj.input;
					$scope.filterValue = obj.filter.value;
					$scope.filterListData = obj.filter.configs;
					$scope.params = [{param:{jrId:$scope.detailData.record.id},sign:'EQ'}];
				}
			}
		});
	})();
	$scope.goBack = function(){
		history.back();
	}
}])

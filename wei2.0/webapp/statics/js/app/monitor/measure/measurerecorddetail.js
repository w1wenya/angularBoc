app.controller('MonitorMeasureRecordDetailCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams',function($rootScope, $scope, httpLoad, $state, $stateParams) {
	$rootScope.moduleTitle = '监控中心 > 配置下发记录详情';
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
			url: '/measure/record/detail',
			method: 'GET',
			data: {id: id},
			success: function(data){
				if(data.success){
					$scope.detailData = data.data;
					$scope.tree_data = formatData(angular.fromJson($scope.detailData.raw || []));
					$scope.isDataLoad = true;
					$scope.params = [{param:{jrId:$scope.detailData.record.id},sign:'EQ'}];
				}
			}
		});
	})();
	$scope.expanding_property = {
		field: "key",
		displayName: "配置项",
	};
	$scope.col_defs = [
		{
			field: "value",
			displayName: "默认值"
		},
		{
			field: "desp",
			displayName: "描述"
		},
		{
			field: "require",
			displayName: "是否必须"
		}
	];
	var formatData = function(data){
		var itemData = [];
		data.forEach(function(item){
			var obj = {
				type:'beans',
				key:item.key,
				value:item.value,
				desp:item.desp,
				require:item.require
			};
			if(item.beans){
				obj.type = 'configs';
				obj.children = formatData(item.beans)
			}
			if(item.configs){
				obj.type = 'configs';
				if(obj.children){
					obj.children = obj.children.concat(formatData(item.configs));
				}else{
					obj.children = formatData(item.configs);
				}
			}
			itemData.push(obj)
		});
		return itemData;
	};
	$scope.goBack = function(){
		history.back();
	}
}])

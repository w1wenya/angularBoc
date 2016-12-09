app.controller('SourceCreateCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams','LANGUAGE',function($rootScope, $scope, httpLoad, $state, $stateParams, LANGUAGE) {
	$rootScope.moduleTitle = '日志中心 > 新增数据源';
	$scope.title = "新增数据源";
	$rootScope.link = '/statics/css/log.css';//引入页面样式
	if($stateParams.id) {
		$rootScope.moduleTitle = '日志中心 > 编辑数据源';
		$scope.title = "编辑数据源";
	};
	var buildConfig = function(){
		var str = '';
		$scope.filterListData.forEach(function (item) {
			str += item.name + '{\n';
			item.beans.forEach(function (cell) {
				str += cell.key + '=>' + cell.value + '\n'
			});
			str += '}\n'
		});
		$scope.filterValue = str;
	};
	var pluginMap = {};
	$scope.inputListData = [{}];$scope.filterListData = [{}];
	$scope.getPlugin = function(item,flag){
		if(!item.name) return;
		httpLoad.loadData({
			url: '/logplugin/detail',
			method: 'GET',
			data: {id: pluginMap[item.name]},
			success: function(data){
				if(data.success){
					var data = data.data;
					item.beans = angular.fromJson(data.config);
					if(flag) buildConfig();
				}
			}
		});
	};
	$scope.getPluginFilter = function(){
		if(!$scope.filterId) return;
		httpLoad.loadData({
			url: '/logplugin/detail',
			method: 'GET',
			data: {id: $scope.filterId},
			success: function(data){
				if(data.success){
					var data = data.data;
					$scope.filter.name = data.name;
					$scope.filter.value = data.config;
				}
			}
		});
	};
	//获取插件列表
	(function () {
		httpLoad.loadData({
			url:'/logplugin/list',
			method:'POST',
			noParam: true,
			data:{
				simple:true,
				params:angular.toJson([{param: {type:'input'}, sign: 'EQ'}])
			},
			success:function(data){
				if(data.success){
					$scope.pluginInputData = data.data.rows;
					$scope.pluginInputData.forEach(function (item) {
						pluginMap[item.value] = item.id;
					});
				}
			}
		});
		httpLoad.loadData({
			url:'/logplugin/list',
			method:'POST',
			noParam: true,
			data:{
				simple:true,
				params:angular.toJson([{param: {type:'filter'}, sign: 'EQ'}])
			},
			success:function(data){
				if(data.success){
					$scope.pluginFilterData = data.data.rows;
					$scope.pluginFilterData.forEach(function (item) {
						pluginMap[item.value] = item.id;
					});
				}
			}
		});
	})();
	(function(){
		var id = $stateParams.id;
		if(id){
			httpLoad.loadData({
				url: '/logsource/detail',
				method: 'GET',
				data: {id: id},
				success: function(data){
					if(data.success){
						var data = data.data;
						$scope.name = data.name;
						$scope.type = data.type;
						$scope.remark = data.remark;
						var obj = angular.fromJson(data.config);
						obj.filter = obj.filter || {};
						$scope.inputListData = obj.input;
						$scope.filterValue = obj.filter.value;
						$scope.filterListData = obj.filter.configs;
					}
				}
			});
		}else {
			$scope.inputListData = [{}];$scope.filterListData = [{}];
		};
	})();
	$scope.addSetting = function(flag){
		if(flag) $scope.filterListData.push({});
		else $scope.inputListData.push({});
	};
	$scope.removeSetting = function(key,data,flag){
		if(data.length == 1) return $scope.pop('请至少添加一个配置项','error');
		data.splice(key,1);
		if(flag) buildConfig();
	};
	$scope.removeItem = function(key,data,flag){
		if(data.length == 1) return $scope.pop('请至少添加一组插件','error');
		data.splice(key,1);
		if(flag) buildConfig();
	};
	$scope.save = function(){
		var url = '/logsource/create';
		var param = {
			name:$scope.name,
			type:$scope.type,
			remark:$scope.remark,
			config: {
				input:$scope.inputListData,
				filter:{
					value:$scope.filterValue,
					configs:$scope.filterListData
				}
			}
			};
			if($stateParams.id){
				url = '/logsource/modify'
				param.id = $stateParams.id;
			}
		httpLoad.loadData({
			url: url,
			method: 'POST',
			data: param,
			success: function(data){
				if(data.success){
					var popTxt = LANGUAGE.LOG.SOURCE.ADD_SUCCESS;
					if($stateParams.id) popTxt = LANGUAGE.LOG.SOURCE.EDIT_SUCCESS;
					$scope.pop(popTxt)
					$scope.goBack();
				}
			}
		});
	};
	$scope.goBack = function(){
		$state.go('app.log.source');
	}
}])

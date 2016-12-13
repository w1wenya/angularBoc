app.controller('PluginCreateCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$stateParams','LANGUAGE','CommonData',function($rootScope, $scope, httpLoad, $state, $stateParams, LANGUAGE, CommonData) {
	$rootScope.moduleTitle = '日志中心 > 新增插件';
	$rootScope.link = '/statics/css/log.css';//引入页面样式
	$scope.title = "新增插件";
	$scope.type = 'filter';
	if($stateParams.id) {
		$rootScope.moduleTitle = '日志中心 > 编辑插件';
		$scope.title = "编辑插件";
	}
	$scope.pluginTypeData = CommonData.pluginType;
	$scope.pluginTypePropertyData=CommonData.filterPluginTypeProperty;
	$scope.pluginTypeChange = function(){
		$scope.pluginTypePropertyData="{}";
		$scope.property="";
		if($scope.type=="input"){
			$scope.pluginTypePropertyData=CommonData.inputPluginTypeProperty;
		}else if($scope.type=="filter"){
			$scope.pluginTypePropertyData=CommonData.filterPluginTypeProperty;
		}
	}
	$scope.settingList = [];
	(function(){
		var id = $stateParams.id;
		if(id){
			httpLoad.loadData({
				url: '/logplugin/detail',
				method: 'GET',
				data: {id: id},
				success: function(data){
					if(data.success){
						var data = data.data;
						var editObj = ['name','type','remark','property'];
						for(var a in editObj){
							var attr = editObj[a];
							$scope[attr] = data[attr];
						}
						$scope.settingList = angular.fromJson(data.config);
					}
				}
			});
		}else $scope.settingList = [{}];
	})();
	$scope.addSetting = function(){
		$scope.settingList.push({});
	};
	$scope.removeSetting = function(key){
		if($scope.settingList.length == 1) return $scope.pop('请至少添加一个配置项','error');
		$scope.settingList.splice(key,1);
	};
	$scope.save = function(){
		var config = {};	var url = '/logplugin/create';
		var flag;
		if($scope.type != 'filter'){
			$scope.settingList.forEach(function(item){
				item.require = item.require || false;
				if(config[item.key]) {
					$scope.pop('KEY值为['+item.key+']存在重复项，请处理','error');
					flag = true;
					return;
				}
				config[item.key] = item.value;
			});
		}
		if(flag) return;
		var param = {
			name:$scope.name,
			type:$scope.type,
			property:$scope.property,
			remark:$scope.remark,
			config:$scope.settingList
			};
			if($stateParams.id){
				url = '/logplugin/modify'
				param.id = $stateParams.id;
			}
		httpLoad.loadData({
			url: url,
			method: 'POST',
			data: param,
			success: function(data){
				if(data.success){
					var popTxt = LANGUAGE.LOG.PLUGIN.ADD_SUCCESS;
					if($stateParams.id) popTxt = LANGUAGE.LOG.PLUGIN.EDIT_SUCCESS;
					$scope.pop(popTxt)
					$scope.goBack();
				}
			}
		});
	};
	$scope.goBack = function(){
		$state.go('app.log.plugin');
	}
}])

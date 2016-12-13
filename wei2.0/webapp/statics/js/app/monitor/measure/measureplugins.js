app.controller('MonitorMeasurePluginCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal','$timeout', '$state', '$stateParams','$compile','LANGUAGE',function($rootScope, $scope, httpLoad, $modal, $timeout, $state, $stateParams, $compile, LANGUAGE) {
	$rootScope.moduleTitle = '监控中心 > 监控项配置';
	$rootScope.link = '/statics/css/monitor.css';//引入页面样式
	var isEdit;
	(function(){
		var id = $stateParams.id;
			httpLoad.loadData({
				url: '/measure/plugin/detail',
				method: 'GET',
				data: {id: id},
				success: function(data){
					if(data.success){
						$scope.detailData = data.data;
						$scope.name = $scope.detailData.name;
						if($scope.detailData.config) isEdit = true;
						$scope.tree_data = formatData(angular.fromJson($scope.detailData.config) || []);
						$('.plugin-tree').append($compile('<tree-grid tree-data="tree_data" tree-action="operation(data)" tree-rows="treeRows" action-data="actionData" tree-control="my_tree" col-defs="col_defs" expand-on="expanding_property" on-select="my_tree_handler(branch)" expand-level="2" icon-leaf= "fa fa-gear"></tree-grid>')($scope))
					}
				}
			});
	})();
	var switchData = function(data){
		var beans = [], configs = [];
		data.forEach(function(item){
			var obj = {
				key:item.key,
				value:item.value,
				desp:item.desp,
				require:item.require
			};
			if(item.type == 'beans'){
			beans.push(obj);
			}else{
				configs.push(obj);
			}
			if(item.children){
				var arr = switchData(item.children);
				if(arr.beans.length) obj.beans = arr.beans;
				if(arr.configs.length) obj.configs = arr.configs;
			}
		});
		return {beans:beans,configs:configs};
	}
	$scope.save = function(){
  	var url = '/measure/plugin/create';
		var config = switchData($scope.tree_data);
		var param = {
			measureId:$stateParams.id,
			name:$scope.name,
			config:config.configs.concat(config.beans)
			};
			if(param.config.length == 0) return $scope.pop('请至少添加一组标签','error')
			if(isEdit){
				url = '/measure/plugin/modify'
				param.id = $scope.detailData.id;
			}
		httpLoad.loadData({
			url: url,
			method: 'POST',
			data: param,
			success: function(data){
				if(data.success){
					var popTxt = LANGUAGE.MONITOR.MONITOR_PLUGIN.ADD_SUCCESS;
					if($stateParams.id) popTxt = LANGUAGE.MONITOR.MONITOR_PLUGIN.EDIT_SUCCESS;
					$scope.pop(popTxt)
					$scope.goBack();
				}
			}
		});
	};
	$scope.goBack = function(){
		$state.go('app.monitor.measure');
	}
	//添加\编辑
	$scope.addItem = function(item){
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/monitor/measure/plugin/addModal.html',
			controller: 'addMeasurePluginModalCtrl',
			backdrop: 'static',
			resolve: {
				itemData: function() {
					var data = item.item;
					if(item.flag == 1){
						data = {
							type: 'beans',
							require: true
						}
					}else if(item.flag == 4){
						data = {
							type: 'configs',
							require: true,
							start:true
						}
					}
					return angular.toJson(data);
				}
			}
		});
		modalInstance.result.then(function(data) {
			if(item.flag == 1){
				item.item.children.push(data);
			}else if(item.flag == 2) {
				var editObj = ['key','value','desp','require','type'];
				editObj.forEach(function (key) {
					item.item[key] = data[key];
				});
			}else{
				$scope.tree_data.push(data);
			}
		});
	}
	var removeTree = function(uid,data){
		for(var i = 0; i < data.length; i++){
			var row = data[i];
			if(uid == row.uid){
				data.splice(i,1);
				return;
			}else if(row.children.length >= 1){
				removeTree(uid,row.children)
			}
		}
	};
	//删除
	$scope.removeItem = function(item){
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/operation/newtask/delModal.html',
			controller: 'delModalCtrl',
			backdrop: 'static',
			resolve:{
				tip: function () {
					return '你确定要删除该项吗？';
				},
				btnList: function () {
					return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
				}
			}
		});
		modalInstance.result.then(function() {
			removeTree(item.uid,$scope.tree_data)
		});
	};
	$scope.operation = function(data){
		switch (data.flag){
			case 1:
			case 2:
			case 4:
				$scope.addItem(data);
				break;
			case 3:
				$scope.removeItem(data.item);
				break;
		}
	};
	//对数据进行格式化处理
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
	$scope.actionData = [{name:'添加',flag:1},{name:'修改',flag:2},{name:'删除',flag:3}];
}])
app.controller('addMeasurePluginModalCtrl', ['$scope', '$modalInstance', 'itemData',
	function($scope, $modalInstance, itemData) {
	$scope.itemData = angular.fromJson(itemData);
		if($scope.itemData.key || $scope.itemData.start) {
			$scope.isDisabled = true;
		}
		//保存按钮
		$scope.ok = function(){
			$modalInstance.close($scope.itemData);
		}
		$scope.cancle = function() {
			$modalInstance.dismiss('cancel');
		};
	}
]);
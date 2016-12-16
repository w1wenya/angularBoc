app.controller('AddDbPhysisCtrl', ['$rootScope','$scope', '$stateParams', '$state', 'httpLoad','CommonData',
	function ($rootScope,$scope, $stateParams, $state, httpLoad,CommonData) {
		$rootScope.link = '/statics/css/tpl-card.css';//引入页面样式
		$scope.typeData = CommonData.dbType;
		sessionStorage.setItem('tabLocation','1');
		//初始化默认值
		$scope.itemData = {
			type:'ORACLE'
		};
		var url = '/pdb/create';
		// 如果为编辑，进行赋值
		var initDetailEdit = function (id) {
			url = '/pdb/modify';
			httpLoad.loadData({
				url: '/pdb/detail',
				method: 'GET',
				data: {id: id},
				success: function (data) {
					if (data.success) {
						$scope.itemData = data.data;
						if($scope.itemData.serviceStart){
							$scope.date = $scope.itemData.serviceStart + ' - ' + $scope.itemData.serviceEnd;
						}
					}
				}
			});
		};
		(function () {
			switch ($stateParams.flag/1){
				case 1:
					$rootScope.moduleTitle = '数据库管理> 添加数据库';
					$scope.modalName = '添加数据库';
					break;
				case 2:
					$rootScope.moduleTitle = '数据库管理> 编辑数据库';
					$scope.modalName = '编辑数据库';
					initDetailEdit($stateParams.id);
					break;
				case 3:
					$rootScope.moduleTitle = '数据库管理> 数据库详情';
					$scope.modalName = '数据库详情';
					$scope.isDetail = true;
					initDetailEdit($stateParams.id)
					break;
			};
		})();

		$scope.showPassword = function (value) {
			$scope[value] = !$scope[value];
		}
		var toFormatTime = function(time, place) {
			if (!time) return "";
			var date = time.split(' - ');
			return date[place/1];
		}
		//保存按钮
		$scope.save = function () {
			$scope.itemData.serviceStart = toFormatTime($scope.date, 0);
			$scope.itemData.serviceEnd = toFormatTime($scope.date, 1);
			httpLoad.loadData({
				url: url,
				data: $scope.itemData,
				success: function (data) {
					if (data.success) {
						$scope.pop($stateParams.id ? '数据库编辑成功' : '数据库添加成功');
						$scope.goBack();
					}
				}
			});
		}
		$scope.goBack = function () {
			$state.go('app.assets.database')
		};
	}
]);
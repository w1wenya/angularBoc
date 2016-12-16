app.controller('AddServerModalCtrl', ['$rootScope','$scope', '$stateParams', '$state', 'httpLoad','CommonData',
	function ($rootScope,$scope, $stateParams, $state, httpLoad,CommonData) {
		$rootScope.link = '/statics/css/tpl-card.css';//引入页面样式
		$scope.environmentData = CommonData.environmentData;
		$scope.typeData = CommonData.hostType;
		sessionStorage.setItem('tabLocation','1');
		//初始化默认值
		$scope.itemData = {
			type:'PC',
			environment:'DEVELOP'
		};
		var url = '/server/create';
		var initDetailCreate = function () {
			$scope.disableSelect = true;
			httpLoad.loadData({
				url: '/rack/detail',
				method: 'GET',
				data: {id: $stateParams.id},
				success: function (data) {
					if (data.success) {
						var data = data.data
						$scope.itemData.dcId = data.dcId;
						$scope.itemData.roomId = data.roomId;
						$scope.itemData.rackId = data.id;
						var loadObj = [$scope.itemData.dcId, $scope.itemData.roomId];
						for (var a in loadObj) {
							$scope.loadSelectData(a, loadObj[a]);
						}
					}
				}
			});
		};
		// 如果为编辑，进行赋值
		var initDetailEdit = function (id) {
			url = '/server/modify';
			httpLoad.loadData({
				url: '/server/basic',
				method: 'GET',
				data: {id: id},
				success: function (data) {
					if (data.success) {
						$scope.itemData = data.data;
						if($scope.itemData.serviceStart){
							$scope.date = $scope.itemData.serviceStart + ' - ' + $scope.itemData.serviceEnd;
						}
						//加载选择数据
						var loadObj = [$scope.itemData.dcId, $scope.itemData.roomId];
						for (var a in loadObj) {
							$scope.loadSelectData(a, loadObj[a]);
						}
					}
				}
			});
		};
		(function () {
			switch ($stateParams.flag/1){
				case 1:
					$rootScope.moduleTitle = '基础设施 > 添加物理主机';
					$scope.modalName = '添加物理主机';
					break;
				case 2:
					$rootScope.moduleTitle = '基础设施 > 编辑物理主机';
					$scope.modalName = '编辑物理主机';
					initDetailEdit($stateParams.id);
					break;
				case 3:
					$rootScope.moduleTitle = '基础设施 > 物理主机详情';
					$scope.modalName = '物理主机详情';
					$scope.isDetail = true;
					initDetailEdit($stateParams.id)
					break;
				case 4:
					$rootScope.moduleTitle = '基础设施 > 添加物理主机';
					$scope.modalName = '添加物理主机';
					$scope.sourceDisabled = true;
					initDetailCreate();
					break;
				case 5:
					$rootScope.moduleTitle = '基础设施 > 编辑物理主机';
					$scope.modalName = '编辑物理主机';
					$scope.sourceDisabled = true;
					initDetailEdit($stateParams.id);
					break;
			};
			//获取数据中心列表数据
			httpLoad.loadData({
				url: '/dc/list',
				noParam: true,
				success: function (data) {
					if (data.success) {
						$scope.dataCenterData = data.data.rows;
					}
				}
			});
		})();
		//四级联动加载数据
		$scope.loadSelectData = function (level, value) {
			//if(!value) return;
			var loadRoom = function () {
				var param = [{param: {dcId: value}, sign: 'EQ'}];
				httpLoad.loadData({
					url: '/room/list',
					noParam: true,
					data: {
						simple: true,
						params: JSON.stringify(param)
					},
					success: function (data) {
						if (data.success) {
							$scope.roomData = data.data.rows;
						}
					}
				})
			};
			var loadRack = function () {
				var param = [{param: {roomId: value}, sign: 'EQ'}];
				httpLoad.loadData({
					url: '/rack/list',
					noParam: true,
					data: {
						simple: true,
						params: JSON.stringify(param)
					},
					success: function (data) {
						if (data.success) {
							$scope.cabinetData = data.data.rows;
						}
					}
				})
			};
			switch (level / 1) {
				case 0:
					loadRoom();
					break;
				case 1:
					loadRack();
					break;
			}
		};
		$scope.showPassword = function (value) {
			$scope[value] = !$scope[value];
		};
		var toFormatTime = function(time, place) {
			if (!time) return "";
			var date = time.split(' - ');
			return date[place/1];
		}
		//保存按钮
		$scope.save = function () {
			if($scope.date){
				$scope.itemData.serviceStart = toFormatTime($scope.date, 0);
				$scope.itemData.serviceEnd = toFormatTime($scope.date, 1);
			}
			httpLoad.loadData({
				url: url,
				data: $scope.itemData,
				success: function (data) {
					if (data.success) {
						$scope.pop($stateParams.id ? '物理机编辑成功' : '物理机添加成功');
						$scope.goBack();
					}
				}
			});
		}
		$scope.goBack = function () {
			history.go(-1);
		};
	}
]);
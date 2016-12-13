app.controller('ServerCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', '$stateParams', '$state', function ($rootScope, $scope, httpLoad, $modal, $stateParams, $state) {
	$rootScope.moduleTitle = '资源中心 > 设备管理';
	$rootScope.link = '/statics/css/tpl-card.css';
	$scope.isCheck = true;
	$scope.isbacthmanage = false;
	//刷新
	$scope.refresh = function () {
		$scope.getServerList();
	};
	//批量管理
	$scope.batchManage = function () {
		$scope.isCheck = !$scope.isCheck;
		$scope.isbacthmanage = !$scope.isbacthmanage;
		if (!$scope.isbacthmanage) {
			angular.forEach($scope.serverListData, function (data, index) {
				data.isChose = false;
			});
		}
	};
	$scope.chooseRepository = function ($event, id) {
		$event.stopPropagation();
		angular.forEach($scope.serverListData, function (data, index) {
			if (data.id == id) {
				data.isChose = !data.isChose;
			}
		});
	};
	//批量删除
	$scope.batchDelete = function () {
		if ($scope.isCheck) return;
		$scope.deleteList = [];
		angular.forEach($scope.serverListData, function (data, index) {
			if (data.isChose == true) {
				$scope.deleteList.push(data.id);
			}
		});
		if ($scope.deleteList.length == 0) return;
		$scope.delServer($scope.deleteList);
	};
	$scope.param = {
		page: 1,
		rows: 10
	};
	//详情机房列表
	if ($stateParams.id) {
		$rootScope.moduleTitle = '资源中心 > 机柜详情';
		$scope.hideSearch = true;
		$scope.param.params = angular.toJson([{param: {rackId: $stateParams.id}, sign: 'EQ'}])
	}
	//获取服务器列表数据
	$scope.getServerList = function (page) {
		$scope.param.page = page || $scope.param.page;
		httpLoad.loadData({
			url: '/server/list',
			data: $scope.param,
			noParam: true,
			success: function (data) {
				if (data.success) {
					$scope.serverListData = data.data.rows;
					$scope.totalCount = data.data.total;
				}
			}
		});
	};
	$scope.getServerList(1);
	//搜索
	$scope.search = function () {
		//对参数进行处理，去除空参数
		var toObjFormat = function (obj) {
			for (var a in obj) {
				if (obj[a] == "") delete obj[a];
			}
			return obj;
		}
		var params = [];
		var param1 = toObjFormat({
			name: $scope.name
		});
		if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
		$scope.param = {
			page: 1,
			rows: 10,
			params: angular.toJson(params)
		}
		$scope.getServerList();
	}
	//重置搜索条件
	$scope.reset = function () {
		var obj = ['name'];
		angular.forEach(obj, function (data) {
			$scope[data] = '';
		})
	};
	(function () {
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
	})()
	//添加/编辑服务器
	$scope.addServer = function ($event, id) {
		$event.stopPropagation();
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/assets/server/addServerModal.html',
			controller: 'addServerModalCtrl',
			backdrop: 'static',
			size: 'lg',
			resolve: {
				dataCenterData: function () {
					return $scope.dataCenterData;
				},
				id: function () {
					return id;
				}
			}
		});
		modalInstance.result.then(function (data) {
			$scope.getServerList();
		});
	};
	//删除服务器
	$scope.delServer = function ($event, id) {
		$event.stopPropagation();
		var modalInstance = $modal.open({
			templateUrl: '/statics/tpl/assets/server/delServerModal.html',
			controller: 'delServerModalCtrl',
			backdrop: 'static',
			resolve: {
				id: function () {
					return id;
				}
			}
		});
		modalInstance.result.then(function () {
			$scope.getServerList();
			$scope.isCheck = true;
			$scope.isbacthmanage = false;
			angular.forEach($scope.serverListData, function (data, index) {
				data.isChose = false;
			});
		});
	};
	//跳转详情页
	$scope.goDetail = function ($event, id) {
		$event.stopPropagation();
		$state.go('app.assets.serverdetail', {id: id})
	};
	$scope.goMonitor = function ($event, id) {
		$event.stopPropagation();
		$state.go('app.monitor.serverMonitor', {id: id})
	};
}])
//添加/编辑服务器ctrl
app.controller('addServerModalCtrl', ['$scope', '$modalInstance', '$stateParams', 'httpLoad', 'LANGUAGE', 'dataCenterData', 'id',
	function ($scope, $modalInstance, $stateParams, httpLoad, LANGUAGE, dataCenterData, id) {
		//编辑对象
		var editObj = ['dcId', 'roomId', 'rackId', 'name', 'remark', 'tags', 'units', 'slotNum', 'slotStart', 'osAccount', 'osPassword', 'ipmiAccount', 'ipmiPassword', 'ipmiAddress', 'managerIp', 'managerPort'];
		$scope.modalName = '添加服务器';
		var url = '/server/create';
		$scope.dataCenterData = dataCenterData;
		$scope.solt_X = true;
		if ($stateParams.id) {
			$scope.disableSelect = true;
			$scope.solt_X = false;
			httpLoad.loadData({
				url: '/rack/detail',
				method: 'GET',
				data: {id: $stateParams.id},
				success: function (data) {
					if (data.success) {
						var data = data.data
						$scope.dcId = data.dcId;
						$scope.roomId = data.roomId;
						$scope.rackId = data.id;
						var loadObj = [$scope.dcId, $scope.roomId];
						for (var a in loadObj) {
							$scope.loadSelectData(a, loadObj[a]);
						}
					}
				}
			});
		}
		;
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
		//如果为编辑，进行赋值
		if (id) {
			url = '/server/modify';
			$scope.modalName = '编辑服务器';
			$scope.solt_X = false;
			httpLoad.loadData({
				url: '/server/basic',
				method: 'GET',
				data: {id: id},
				success: function (data) {
					if (data.success) {
						var data = data.data;
						for (var a in editObj) {
							var attr = editObj[a];
							$scope[attr] = data[attr];
						}
						//加载选择数据
						var loadObj = [$scope.dcId, $scope.roomId];
						for (var a in loadObj) {
							$scope.loadSelectData(a, loadObj[a]);
						}
					}
				}
			});
		}
		$scope.rackChange = function (rackId) {
			if (rackId) $scope.solt_X = false;
			else $scope.solt_X = true;
		}
		
		$scope.outFouse = function () {
			if (!$scope.slotStart || !$scope.slotNum) {
				return false;
			}
			var param = {slotStart: $scope.slotStart, slotNum: $scope.slotNum, id: $scope.rackId, serverId: id};
			httpLoad.loadData({
				url: '/rack/checkSlot',
				method: 'GET',
				data: param,
				success: function (data) {
					if (data.success) $scope.isFail = false;
					else $scope.isFail = true;
					;
				}
			});
		};
		$scope.showPassword = function (value) {
			$scope[value] = !$scope[value];
		}
		//保存按钮
		$scope.ok = function () {
			var param = {};
			for (var a in editObj) {
				var attr = editObj[a];
				if (attr != 'dcId' && attr != 'roomId' && attr != 'zoneId') {
					param[attr] = $scope[attr];
				}
			}
			if (id) param.id = id;
			httpLoad.loadData({
				url: url,
				data: param,
				success: function (data) {
					if (data.success) {
						$scope.pop(id ? LANGUAGE.ASSETS.SERVER.EDIT_SUCCESS : LANGUAGE.ASSETS.SERVER.ADD_SUCCESS);
						$modalInstance.close(param);
					}
				}
			});
		}
		$scope.cancle = function () {
			$modalInstance.dismiss('cancel');
		};
	}
])
//删除机房ctrl
angular.module('app').controller('delServerModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'LANGUAGE', 'id',
	function ($scope, $modalInstance, httpLoad, LANGUAGE, id) {
		$scope.ok = function () {
			httpLoad.loadData({
				url: '/server/remove',
				data: {id: id},
				success: function (data) {
					if (data.success) {
						console.log({id: id});
						$scope.pop(LANGUAGE.ASSETS.SERVER.DEL_SUCCESS);
						$modalInstance.close();
					}
				}
			});
		}
		$scope.cancle = function () {
			$modalInstance.dismiss('cancel');
		};
	}
]);

//angular.module('app').directive('paging', function() {
//	return {
//		restrict: 'EA',
//		scope: false,
//		template: '<span class="right-list-paging">'+
//		'<a ng-click="goPage(1)" ng-class="{true:\'right-list-gopage\',false:\'right-list-ban\'}[isPre]"><i class="fa fa-chevron-left"></i></a>'+
//		'<input type="number" ng-change="isGoF()" class="input" ng-model="pageNo" min="1" max="{{totalPage}}"placeholder="{{param.pageNo}}/{{totalPage}}"/>'+
//		'<a  ng-click="goPage(2)" class="right-list-go" ng-class="{true:\'right-list-gopage\',false:\'right-list-ban\'}[isGo]">GO</a>'+
//		'<a ng-click="goPage(3)"ng-class="{true:\'right-list-gopage\',false:\'right-list-ban\'}[isNext]"><i class="fa fa-chevron-right"></i></a></span>',
//		link: function (scope, element, attrs) {
//			scope.isGo = false;
//			scope.isGoF = function(){
//				scope.isGo = false;
//				if(scope.pageNo >= 1 && scope.pageNo <= scope.totalPage)  scope.isGo = true;;
//			}
//			//页码选择
//			scope.goPage = function(flag){
//				var page = 0;
//				switch (flag){
//					case 1:
//						page = scope.param.pageNo - 1;
//						break;
//					case 2:
//						page = scope.pageNo;
//						break;
//					case 3:
//						page = scope.param.pageNo + 1;
//						break;
//				}
//				if(page >= 1 && page <= scope.totalPage) {
//					scope.currentKey = 0;
//					scope.getServerList(page);
//				}
//			}
//		}
//	}
//});
angular.module('app').directive('ngDrawThreeServer', function () {
	return {
		restrict: 'EA',
		scope: false,
		link: function (scope, element, attrs) {
			var heightone = 366, widthone = 910;
			var scene_server = new THREE.Scene();
			var raycaster, renderer_server, camera, container, loader1, light, lightA;
			var Three_server = function () {
				this.init();
				this.animate();
			};
			Three_server.prototype = {
				//初始化
				init: function () {
					container = $('.cave_Server');
					loader1 = new THREE.OBJMTLLoader();
					var status = scope.serverDetailData.status;
					if (status == "ABNORMAL") {
						loader1.load('/resources/models/hongF.obj', '/resources/models/hongF.mtl', function (dogObject) {
							dogObject.scale.set(0.15, 0.15, 0.15);
							dogObject.position.y = 0;
							dogObject.position.x = 0;
							dogObject.position.z = 18;
							scene_server.add(dogObject);
						});
					} else if (status == "ALARM") {
						loader1.load('/resources/models/huangF.obj', '/resources/models/huangF.mtl', function (dogObject) {
							dogObject.scale.set(0.15, 0.15, 0.15);
							dogObject.position.y = 0;
							dogObject.position.x = 0;
							dogObject.position.z = 18;
							scene_server.add(dogObject);
						});
					} else {
						loader1.load('/resources/models/lvF.obj', '/resources/models/lvF.mtl', function (dogObject) {
							dogObject.scale.set(0.15, 0.15, 0.15);
							dogObject.position.y = 0;
							dogObject.position.x = 0;
							dogObject.position.z = 18;
							scene_server.add(dogObject);
						});
					}
					
					//光线加载
					//light=new THREE.DirectionalLight(0xffffff);
					//light.position.set(100,200,400);
					lightA = new THREE.PointLight(0xffffff);
					lightA.position.set(100, 200, 400);
					//lightA.position.set(0,0,18);
					//scene_server.add(light);
					scene_server.add(lightA);
					scene_server.add(new THREE.AmbientLight(0x333333));
					//照相机加载
					camera = new THREE.PerspectiveCamera(50, widthone / heightone, 1, 6000);
					camera.position.set(100, 100, 250);
					camera.lookAt(scene_server.position);
					camera.updateMatrixWorld();
					//渲染器加载
					raycaster = new THREE.Raycaster();
					renderer_server = new THREE.WebGLRenderer();
					renderer_server.setSize(widthone, heightone);
					container[0].appendChild(renderer_server.domElement);
					renderer_server.setClearColor(0xffffff);
					//renderer_server.setClearColor(0xFFFFFF, 1.0);//设置渲染器的清除色
					renderer_server.render(scene_server, camera);
					var controls = new THREE.OrbitControls(camera, container[0]);
					controls.addEventListener('change', this.render_sercer);
					this.render_sercer();
				},
				render_sercer: function () {
					renderer_server.render(scene_server, camera);
				},
				////监听鼠标变换
				animate: function () {
					requestAnimationFrame(this.animate.bind(this));
					this.render_sercer();
				}
			};
			var Three = new Three_server();
		}
	}
});

//angular.module('app').directive('paging', function() {
//	return {
//		restrict: 'EA',
//		scope: false,
//		template: '<span class="right-list-paging">'+
//		'<a ng-click="goPage(1)" ng-class="{true:\'right-list-gopage\',false:\'right-list-ban\'}[isPre]"><i class="fa fa-chevron-left"></i></a>'+
//		'<input type="number" ng-change="isGoF()" class="input" ng-model="pageNo" min="1" max="{{totalPage}}"placeholder="{{param.pageNo}}/{{totalPage}}"/>'+
//		'<a  ng-click="goPage(2)" class="right-list-go" ng-class="{true:\'right-list-gopage\',false:\'right-list-ban\'}[isGo]">GO</a>'+
//		'<a ng-click="goPage(3)"ng-class="{true:\'right-list-gopage\',false:\'right-list-ban\'}[isNext]"><i class="fa fa-chevron-right"></i></a></span>',
//		link: function (scope, element, attrs) {
//			scope.isGo = false;
//			scope.isGoF = function(){
//				scope.isGo = false;
//				if(scope.pageNo >= 1 && scope.pageNo <= scope.totalPage)  scope.isGo = true;;
//			}
//			//页码选择
//			scope.goPage = function(flag){
//				var page = 0;
//				switch (flag){
//					case 1:
//						page = scope.param.pageNo - 1;
//						break;
//					case 2:
//						page = scope.pageNo;
//						break;
//					case 3:
//						page = scope.param.pageNo + 1;
//						break;
//				}
//				if(page >= 1 && page <= scope.totalPage) {
//					scope.currentKey = 0;
//					scope.getServerList(page);
//				}
//			}
//		}
//	}
//});
angular.module('app').directive('ngDrawThreeServer', function () {
	return {
		restrict: 'EA',
		scope: false,
		link: function (scope, element, attrs) {
			var heightone = 366, widthone = 910;
			var scene_server = new THREE.Scene();
			var raycaster, renderer_server, camera, container, loader1, light, lightA;
			var Three_server = function () {
				this.init();
				this.animate();
			};
			Three_server.prototype = {
				//初始化
				init: function () {
					container = $('.cave_Server');
					loader1 = new THREE.OBJMTLLoader();
					var status = scope.serverDetailData.status;
					if (status == "ABNORMAL") {
						loader1.load('/resources/models/hongF.obj', '/resources/models/hongF.mtl', function (dogObject) {
							dogObject.scale.set(0.15, 0.15, 0.15);
							dogObject.position.y = 0;
							dogObject.position.x = 0;
							dogObject.position.z = 18;
							scene_server.add(dogObject);
						});
					} else if (status == "ALARM") {
						loader1.load('/resources/models/huangF.obj', '/resources/models/huangF.mtl', function (dogObject) {
							dogObject.scale.set(0.15, 0.15, 0.15);
							dogObject.position.y = 0;
							dogObject.position.x = 0;
							dogObject.position.z = 18;
							scene_server.add(dogObject);
						});
					} else {
						loader1.load('/resources/models/lvF.obj', '/resources/models/lvF.mtl', function (dogObject) {
							dogObject.scale.set(0.15, 0.15, 0.15);
							dogObject.position.y = 0;
							dogObject.position.x = 0;
							dogObject.position.z = 18;
							scene_server.add(dogObject);
						});
					}
					
					//光线加载
					//light=new THREE.DirectionalLight(0xffffff);
					//light.position.set(100,200,400);
					lightA = new THREE.PointLight(0xffffff);
					lightA.position.set(0, 0, 18);
					scene_server.add(light);
					scene_server.add(lightA);
					scene_server.add(new THREE.AmbientLight(0x333333));
					//照相机加载
					camera = new THREE.PerspectiveCamera(50, widthone / heightone, 1, 6000);
					camera.position.set(100, 100, 250);
					camera.lookAt(scene_server.position);
					camera.updateMatrixWorld();
					//渲染器加载
					raycaster = new THREE.Raycaster();
					renderer_server = new THREE.WebGLRenderer();
					renderer_server.setSize(widthone, heightone);
					container[0].appendChild(renderer_server.domElement);
					renderer_server.setClearColor(0xffffff);
					//renderer_server.setClearColor(0xFFFFFF, 1.0);//设置渲染器的清除色
					renderer_server.render(scene_server, camera);
					var controls = new THREE.OrbitControls(camera, container[0]);
					controls.addEventListener('change', this.render_sercer);
					this.render_sercer();
				},
				render_sercer: function () {
					renderer_server.render(scene_server, camera);
				},
				////监听鼠标变换
				animate: function () {
					requestAnimationFrame(this.animate.bind(this));
					this.render_sercer();
				}
			};
			var Three = new Three_server();
		}
	}
});

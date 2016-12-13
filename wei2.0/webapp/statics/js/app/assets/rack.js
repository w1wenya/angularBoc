 angular.module('app').controller('RackCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', '$stateParams', '$state', function($rootScope, $scope, httpLoad, $modal, $stateParams, $state) {
	 $rootScope.moduleTitle = '资源中心 > 机柜管理';
	 $rootScope.link = '/statics/css/tpl-card.css';
	 $scope.param = {
	 	 page:1,
		 rows: 10
	 };
	 //详情机柜列表
	 if($stateParams.id){
		 $rootScope.moduleTitle = '资源中心 > 机房详情';
		 $scope.hideSearch = true;
		 $scope.param.params = angular.toJson([{param:{roomId:$stateParams.id},sign:'EQ'}])
	 }
	 $scope.isCheck = true;
	 $scope.isbacthmanage = false;
	//刷新
	$scope.refresh = function(){
		$scope.getCabinetList();
	};
	 //批量管理
	 $scope.batchManage = function(){
		$scope.isCheck = !$scope.isCheck;
		$scope.isbacthmanage = !$scope.isbacthmanage;
		if(!$scope.isbacthmanage){
			angular.forEach($scope.cabinetListData, function(data,index){
				data.isChose = false;
	        });
		}
	 };
	 $scope.chooseRepository = function($event,id){
		$event.stopPropagation();
		angular.forEach($scope.cabinetListData, function(data,index){
			if(data.id == id){
				data.isChose = !data.isChose;
			}				
        });
	 };
	//批量删除
	$scope.batchDelete = function(){
		if($scope.isCheck) return;
		$scope.deleteList=[];
		angular.forEach($scope.cabinetListData, function(data,index){
			if(data.isChose == true){
				$scope.deleteList.push(data.id);
			}				
        });
		if($scope.deleteList.length==0) return;
		$scope.delCabinet($scope.deleteList);
	};
	 //获取机柜列表数据
	 $scope.getCabinetList = function(page){
		$scope.param.page = page || $scope.param.page;
		httpLoad.loadData({
			 url: '/rack/list',
			 data: $scope.param,
			 noParam:true,
			 success: function(data){
				 if(data.success) {
					 $scope.cabinetListData = data.data.rows;
					 $scope.totalCount = data.data.total;
				 }
			 }
		});
	 };
	 $scope.getCabinetList(1);
	 //搜索
	 $scope.search = function(){
		 //对参数进行处理，去除空参数
		 var toObjFormat = function(obj) {
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
		 $scope.getCabinetList();
	 }
	 //重置搜索条件
	 $scope.reset = function(){
		 var obj = ['name'];
		 angular.forEach(obj,function(data){
			 $scope[data] = '';
		 })
	 };
	 (function(){
		 //获取数据中心列表数据
		 httpLoad.loadData({
			 url: '/dc/list',
			 noParam:true,
			 success: function(data){
				 if(data.success) {
					 $scope.dataCenterList = data.data.rows;
				 }
			 }
		 });
		 //获取机柜类型列表数据
		 httpLoad.loadData({
			 url: '/dict/children',
			 method: 'GET',
			 data: {
				 value :"RACK_CATEGORY",
			 },
			 success: function(data){
				 if(data.success) {
					 $scope.dataType = data.data;
				 }
			 }
		 });
		 //获取机柜材质列表数据
		 httpLoad.loadData({
			 url: '/dict/children',
			 method: 'GET',
			 data: {
				 value :"RACK_MATERIAL",
			 },
			 success: function(data){
				 if(data.success) {
					 $scope.dataMaterial = data.data;
				 }
			 }
		 });
	 })();
	 $scope.goDetail = function($event,id){
		 $event.stopPropagation();
		 $state.go('app.assets.rackdetail',{id:id})
	 }
	 //添加/编辑机柜
	 $scope.addCabinet = function($event, id){
		 $event.stopPropagation();
		 var modalInstance = $modal.open({
			 templateUrl: '/statics/tpl/assets/rack/addCabinetModal.html',
			 controller: 'addCabinetModalCtrl',
			 backdrop: 'static',
			 size: 'lg',
			 resolve: {
				 dataCenterData: function() {
				  return  $scope.dataCenterList;
				 },
				 dataType:function(){
					 return  $scope.dataType;
				 },
				 dataMaterial:function(){
					 return $scope.dataMaterial;
				 },
				 id: function() {
					 return id;
				 }
			 }
		 });
		 modalInstance.result.then(function(data) {
			 $scope.getCabinetList();
		 });
	 }
	 //删除机柜
	 $scope.delCabinet = function($event,id){
		 $event.stopPropagation();
		 var modalInstance = $modal.open({
			 templateUrl: '/statics/tpl/assets/rack/delCabinetModal.html',
			 controller: 'delCabinetModalCtrl',
			 backdrop: 'static',
			 resolve: {
				 id: function() {
					 return  id;
				 },
			 }
		 });
		 modalInstance.result.then(function() {
			 $scope.getCabinetList();
			 $scope.isCheck = true;
        	 $scope.isbacthmanage = false;
			 angular.forEach($scope.cabinetListData, function(data,index){
				data.isChose = false;
	         });
		 });
	 }
	 //跳转详情页
	 $scope.getDetailInfo = function($event,id){
		 $event.stopPropagation();
		 $state.go('app.assets.cabinetDetail',{id:id})
	 };
	 $scope.goMonitor = function($event,id){
		 $event.stopPropagation();
		 $state.go('app.monitor.rackMonitor',{id:id})
	 }
	}]);
 //添加/编辑机柜ctrl
 angular.module('app').controller('addCabinetModalCtrl', ['$scope', '$modalInstance', '$stateParams', 'httpLoad', 'LANGUAGE', 'dataCenterData','dataType','dataMaterial', 'id',
	 function($scope, $modalInstance, $stateParams,  httpLoad, LANGUAGE, dataCenterData,dataType,dataMaterial, id) {
		 $scope.modalName = '添加机柜';
		 $scope.today = new Date();
		 $scope.dataCenterData = dataCenterData;
		 $scope.dataType = dataType;
		 $scope.dataMaterial = dataMaterial;
		 $scope.inpit_Y= true;
		 if($stateParams.id){
			 $scope.inpit_Y= false;
			 $scope.disableSelect = true;
			 httpLoad.loadData({
				 url: '/room/detail',
				 method: 'GET',
				 data: {id: $stateParams.id},
				 success: function(data){
					 if(data.success){
					 	var data = data.data
						 $scope.dcId = data.dcId;
						 $scope.roomId = data.id;
						 $scope.loadRoomData($scope.dcId);
					 }
				 }
			 });
		 };
		 var editObj = ['name','remark','specs','vendor','productDate','productSn','warranty','type','axisX','axisY','slotAmount','material','dcId','roomId','zoneId','unit'];
		 var url = '/rack/create';
		 $scope.solt_X = true;
		 //获取机房列表信息
		 $scope.loadRoomData = function(id){
			 var param = [{ param:{dcId:id},sign:'EQ'}];
			 httpLoad.loadData({
				 url: '/room/list',
				 noParam: true,
				 data: {
					params : JSON.stringify(param)
				 },
				 success: function(data){
					 if(data.success) {
						 $scope.roomData = data.data.rows;
					 }
				 }
			 });
		 };
		 //如果为编辑，进行赋值
		 if(id){
			 url = '/rack/modify';
			 $scope.modalName = '编辑机柜';
			 httpLoad.loadData({
				 url: '/rack/basic',
				 method: 'GET',
				 data: {id: id},
				 success: function(data){
					 if(data.success) {
						 var data = data.data;
						 for(var a in editObj){
							 var attr = editObj[a];
							 $scope[attr] = data[attr];
						 }
						 $scope.inpit_Y= false;
						 $scope.unit = parseInt($scope.unit);
						 $scope.slotAmount = parseInt($scope.slotAmount);
						 $scope.axisX = parseInt($scope.axisX);
						 $scope.axisY = parseInt($scope.axisY);
						 $scope.loadRoomData($scope.dcId);
					 }
				 }
			 });
		 }
		 $scope.changeRoom = function (id) {
			 if(id)  $scope.inpit_Y= false;
		 }
		//s失去焦点
		 $scope.outFouse = function(){
			 if(!$scope.axisX || !$scope.axisY){
				 return false;
			 }
			 var param = {axisX:$scope.axisX,axisY:$scope.axisY,id:$scope.roomId};
			 httpLoad.loadData({
				 url: '/room/checkPoint',
				 method: 'GET',
				 data: param,
				 success: function(data){
					 if(data.success) $scope.isFail = false;
					 else $scope.isFail = true;;
				 }
			 });
		 };
         //卡槽范围
		 $scope.roundFouse = function(){
			 if(id){
				 var param = {slotAmount:$scope.slotAmount,id:id};
			 }else{
				return false
			 }
			 httpLoad.loadData({
				 url: '/rack/checkRange',
				 method: 'GET',
				 data: param,
				 success: function(data){
					 if(data.success) $scope.isRoundFail = false;
					 else $scope.isRoundFail = true;;
				 }
			 });
		 };

		 //保存按钮
		 $scope.ok = function(){
			 var param = {};
			 for(var a in editObj){
				 var attr = editObj[a];
				 if(attr!='dcId'){
					 param[attr] = $scope[attr];
				 }	 
			 }
			 if(id) param.id = id;
			 httpLoad.loadData({
				 url: url,
				 data: param,
				 success: function(data){
					 if(data.success) {
						 $scope.pop(id ? LANGUAGE.ASSETS.RACK.EDIT_SUCCESS : LANGUAGE.ASSETS.RACK.ADD_SUCCESS);
						 $modalInstance.close(param);
					 }
				 }
			 });
		 }
		 $scope.cancle = function() {
			 $modalInstance.dismiss('cancel');
		 };
	 }
 ]);
 //删除机柜ctrl
 angular.module('app').controller('delCabinetModalCtrl', ['$scope', '$modalInstance','httpLoad','LANGUAGE','id',
	 function($scope, $modalInstance, httpLoad, LANGUAGE, id) {
		 $scope.ok = function(){
			 httpLoad.loadData({
				 url: '/rack/remove',
				 data:{id: id},
				 success: function(data){
					 if(data.success) {
						 $scope.pop(LANGUAGE.ASSETS.RACK.DEL_SUCCESS);
						 $modalInstance.close();
					 }
				 }
			 });
		 }
		 $scope.cancle = function(){
			 $modalInstance.dismiss('cancel');
		 };
	 }
 ]);

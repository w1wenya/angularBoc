/**
 * Created by Yang Zhenrong on 2016/9/26.
 */
(function(){
	app.controller('EsLogCtrl', ['$rootScope', '$scope','$modal','$state', 'httpLoad', 
	    function($rootScope, $scope,$modal,$state, httpLoad) {
		$rootScope.moduleTitle = '日志管理> 日志浏览';
		(function(){
			httpLoad.loadData({
				url: '/log/checkRole',
				noParam: true,
				success: function(data){
					if(data.success){
						if(data.data){
							document.getElementById("tenantDiv").style.display="block";
							document.getElementById("tenantDiv").style.float="left";
						}
					}
				}
			});
			httpLoad.loadData({
				url: '/log/getTenantList',
				noParam: true,
				success: function(data){
					if(data.success){
						$scope.tenantListData = data.data;
					}
				}
			});
			httpLoad.loadData({
				url: '/log/getLoglevel',
				noParam: true,
				success: function(data){
					if(data.success){
						$scope.loglevelListData = data.data;
					}
				}
			});
			httpLoad.loadData({
				url: '/log/eslogindex/list',
				noParam: true,
				success: function(data){
					if(data.success){
						$scope.indexListData = data.data.rows;
					}
				}
			});
			httpLoad.loadData({
				url: '/log/eslogtype/list',
				noParam: true,
				success: function(data){
					if(data.success){
						$scope.typeListData = data.data.rows;
					}
				}
			});
		})();
		$scope.dateAdd = function(nd,days){
			//var nd = new Date(date);
			nd = nd.valueOf();
			nd = nd + days * 24 * 60 * 60 * 1000;
			return new Date(nd);
		};
		
		$scope.dateChange = function(date) {
			var nd = new Date(date);
			var y = nd.getFullYear();
			var m = nd.getMonth()+1;
			var d = nd.getDate();
			var h = nd.getHours();
			var mm = nd.getMinutes();
			var s = nd.getSeconds();
			if(m <= 9) m = "0"+m;
			if(d <= 9) d = "0"+d; 
			if(h <= 9) h = "0"+h;
			if(mm <= 9) mm = "0"+mm;
			if(s <= 9) s = "0"+s;
			var cdate = y+"-"+m+"-"+d+" "+h+":"+mm+":"+s;
			return cdate;
		};
		var dateNow = new Date();
		$scope.date  = $scope.dateChange($scope.dateAdd(dateNow,-6)) + " - " + $scope.dateChange(dateNow);			
		
		var params = [];
		//对时间进行处理
		var toFormatTime = function(time, place) {
			if (!time) return "";
			var date = time.split(' - ');
			return date[place/1];
		}
		if ($scope.date) {
			params.push({param: {timestamp: toFormatTime($scope.date, 0)}, sign: 'GET'});
			params.push({param: {timestamp: toFormatTime($scope.date, 1)}, sign: 'LET'});
		}
		$scope.param = {
			page: 1,
			rows: 10,
			params: angular.toJson(params)
		}
		$scope.getList = function(page){
			$scope.param.page = page || $scope.param.page;
			httpLoad.loadData({
				url: '/log/eslog/list',
				data: $scope.param,
				noParam: true,
				success: function(data){
					if(data.success){
						$scope.listData = data.data.rows;
						$scope.totalPage = data.data.total;
					}
				}
			});
		};
		$scope.getList(1);
		//对参数进行处理，去除空参数
		var toObjFormat = function(obj) {
			for (var a in obj) {
				if (obj[a] == "") delete obj[a];
			}
			return obj;
		}
		//搜索
		$scope.search = function(){
			var params = [];
			var param1 = toObjFormat({
				index: $scope.index,
				type: $scope.type,
				loglevel:$scope.loglevel,
				tenantid: $scope.tenantid
			});
			var param2 = toObjFormat({
				host: $scope.host,
				logflag:$scope.logflag,
				message: $scope.message
			});
			params.push({param: param1, sign: 'EQ'});
			if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'LK'});
			if ($scope.date) {
				params.push({param: {timestamp: toFormatTime($scope.date, 0)}, sign: 'GET'});
				params.push({param: {timestamp: toFormatTime($scope.date, 1)}, sign: 'LET'});
			}
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson(params)
			}
			$scope.getList();
		}
		$scope.export = function(){
			var params = [];
			var param1 = toObjFormat({
				index: $scope.index,
				type: $scope.type,
				loglevel: $scope.loglevel,
				tenantid: $scope.tenantid
			});
			var param2 = toObjFormat({
				logflag: $scope.logflag,
				host: $scope.host,
				message: $scope.message
			});
			params.push({param: param1, sign: 'EQ'});
			if (angular.toJson(param2).length > 2) 
				params.push({param: param2, sign: 'LK'});
			if ($scope.date) {
				params.push({param: {timestamp: toFormatTime($scope.date, 0)}, sign: 'GET'});
				params.push({param: {timestamp: toFormatTime($scope.date, 1)}, sign: 'LET'});
			}
        	document.getElementById("eslogexport").setAttribute("src","/logexport/eslog/export?params="+angular.toJson(params));

		}
		//重置搜索条件
		$scope.reset = function(){
			var obj = ['date','index','logflag','type','host','loglevel','message','tenantid'];
			angular.forEach(obj,function(data){
				$scope[data] = '';
				$scope.date  = $scope.dateChange($scope.dateAdd(dateNow,-6)) + " - " + $scope.dateChange(dateNow);	
			});
		}
		 $scope.detail = function(item){  //打开模态
             var modalInstance = $modal.open({
                 templateUrl : '/statics/tpl/log/eslogdetail.html',  //指向上面创建的视图
                 controller : 'detailLogModalCtrl',// 初始化模态范围
                 resolve : {
                     itemData: function() {
                         return item;
                     }
                 }
             });
             modalInstance.result.then(function(data){
                 angular.extend(item,data);
             },function(){});
         };
	}]);
	angular.module('app').controller('detailLogModalCtrl',['$scope','$modalInstance','itemData','LANGUAGE','httpLoad',
           function($scope,$modalInstance,itemData,LANGUAGE,httpLoad){ //依赖于modalInstance
		   $scope.logDetailData=itemData;
           $scope.cancel = function(){
               $modalInstance.dismiss('cancel'); // 退出
           };
    }]);
})();
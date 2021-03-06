/**
 * Created by Zhang Haijun on 2016/8/11.
 */
(function(){
	app.controller('PlatformCtrl', ['$rootScope', '$scope', 'httpLoad', function($rootScope, $scope, httpLoad) {
		$rootScope.moduleTitle = '日志管理 > 平台日志';
		$scope.param = {
			page: 1,
			rows: 10
		};
		$scope.getList = function(page){
			$scope.param.page = page || $scope.param.page;
			httpLoad.loadData({
				url: '/log/sys/list',
				data: $scope.param,
				noParam: true,
				success: function(data){
					$scope.listData = data.data.rows;
					$scope.totalPage = data.data.total;
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
			//对时间进行处理
			var toFormatTime = function(time, place) {
				if (!time) return "";
				var date = time.split(' - ');
				return date[place/1];
			}
			var params = [];
			var param1 = toObjFormat({
				module: $scope.module,
				level: $scope.level,
				ip: $scope.ip
			});
			if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
			if ($scope.date) {
				params.push({param: {gmtCreate: toFormatTime($scope.date, 0)}, sign: 'GET'});
				params.push({param: {gmtCreate: toFormatTime($scope.date, 1)}, sign: 'LET'});
			}
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson(params)
			}
			$scope.getList()
		}
		//重置搜索条件
		$scope.reset = function(){
			var obj = ['module','ip','date','level'];
			angular.forEach(obj,function(data){
				$scope[data] = '';
			})
		}
	}]);
})();
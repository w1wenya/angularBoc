/**
 * Created by Zhang Haijun on 2016/6/16.
 */
(function(){
	"use strict";
	app.service('HistoryData', function() {
		var service = {
			//定义任务状态
			statusModeData:{
				UNEXCUTE: '未执行',
				RUNNING: '正在执行',
				SUCCESS: '执行成功',
				FAIL: '执行失败',
				SKIPPED: '跳过',
				IGNORE: '忽略错误',
				WAITING: '等待用户',
				CANCEL: '手动结束',
				ABNORMAL: '状态异常'
			},
			//定义启动方式
			startWaysData:{
				WEB: '页面执行',
				API: 'API调用',
				CRON: '定时执行'
			},
		};
		return service;
	});
	app.controller('HistoryListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','HistoryData',
		function($scope, httpLoad, $rootScope, $modal, $timeout, HistoryData) {
			$rootScope.moduleTitle = '执行历史 > 执行历史';//定义当前页
			$scope.statusModeData = HistoryData.statusModeData;
			$scope.startWaysData = HistoryData.startWaysData;
			//获取脚本列表数据
			$scope.param = {
				page: 1,
				rows: 10
			}
			$scope.getHistoryList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/record/list',
					method:'POST',
					noParam:true,
					data:$scope.param,
					success:function(data){
						if(data.success){
							$scope.historyListData = data.data.rows;
							$scope.totalPage = data.data.total;
						}
					}
				});
			}
			$scope.getHistoryList();
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
					name:$scope.name
				});
				var param2 = toObjFormat({
					status:$scope.status,
					mode: $scope.mode,
					createrId: $scope.createrId || $scope.creator
				});
				if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
				if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
				if ($scope.date) {
					params.push({param: {startTime: toFormatTime($scope.date, 0)}, sign: 'GET'});
					params.push({param: {startTime: toFormatTime($scope.date, 1)}, sign: 'LET'});
				}
				$scope.param = {
					page: 1,
					rows: 10,
					params: angular.toJson(params)
				}
				$scope.getHistoryList(1)
			}
			//重置搜索条件
			$scope.reset = function(){
				var obj = ['name','creater','date','taskStatus','startWay'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
		}
	]);
})()


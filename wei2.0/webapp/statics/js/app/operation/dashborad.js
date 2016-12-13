app.controller('DashboradTaskCtrl', ['$rootScope', '$scope', 'httpLoad',function($rootScope, $scope, httpLoad) {
	$rootScope.moduleTitle = '日常作业 > 作业统计';
	$rootScope.link = '/statics/css/task.css';
	httpLoad.loadData({
			url: '/stats/task',
			method: 'GET',
		  noParam:true,
			success: function(data){
				if(data.success) {
					$scope.isDataLoad = true;
					$scope.dashboradData = data.data;
				}
			}
		});
	httpLoad.loadData({
		url:'/record/list',
		method:'POST',
		noParam:true,
		data:{
			page:1,
			rows:20
		},
		success:function(data){
			if(data.success){
				$scope.historyListData = data.data.rows;
			}
		}
	});
}]);
app.directive('ngTaskDashboradLineChart', [ function () {
	return {
		restrict: 'EA',
		scope:{
			data:'='
		},
		link: function (scope, element, attrs) {
			var chart = echarts.init($(element)[0]);
			var initEchart = function (xAxis,legend,series) {
				var option = {
					tooltip : {
						trigger: 'axis'
					},
					legend: {
						data:legend
					},
					toolbox: {
						show : true,
						feature : {
							mark : {show: true},
							dataView : {show: true, readOnly: false},
							magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
							restore : {show: true},
							saveAsImage : {show: true}
						}
					},
					calculable : true,
					xAxis : [
						{
							type : 'category',
							boundaryGap : false,
							data : xAxis
						}
					],
					yAxis : [
						{
							type : 'value'
						}
					],
					grid: {
						left: '1%',
						right: '2%',
						top:'10%',
						bottom: '6%',
						containLabel: true
					},
					series : series
				};
				chart.setOption(option);
			}
			var nameMap = {
				RUNNING: '执行中',
				SUCCESS: '成功',
				FAIL: '失败',
				CANCEL: '取消'
			};
			var colorMap = {
				'RUNNING':'#00aeef',
				'SUCCESS':'#27c24c',
				'FAIL':'#f05050',
				'CANCEL':'#fad733'
			}
			var legendData = [],series = [];
			//数据处理
			(function () {
				scope.data.values.forEach(function (item) {
					legendData.push(nameMap[item.name]);
					series.push({
						name:nameMap[item.name],
						type:'line',
						smooth:true,
						itemStyle: {
							normal: {
								areaStyle: {type: 'default'},
								color:colorMap[item.name],
								opacity:0.8
							}},
						data:item.data
					});
				});
				initEchart(scope.data.keys,legendData,series);
			})();
	}}
}]);
app.directive('ngTaskDashboradPieChart', [function () {
	return {
		restrict: 'EA',
		scope:{
			data:'='
		},
		link: function (scope, element, attrs) {
			var map = {
				RUNNING: '执行中',
				SUCCESS: '成功',
				FAIL: '失败',
				CANCEL: '取消',
				ONE:'1分钟内',
				THREE:'1-3分钟内',
				FIVE:'3-5分钟',
				TEN:'5-10分钟',
				THIRTY:'10-30分钟',
				HOUR:'30分钟以上'
			}
			var chart = echarts.init($(element)[0]);
			var initEchart = function (legend,series) {
				var option = {
					tooltip : {
						trigger: 'item',
						formatter: "{a} <br/>{b} : {c} ({d}%)"
					},
					legend: {
						orient : 'vertical',
						x : 'left',
						data:legend
					},
					toolbox: {
						show : true,
						feature : {
							mark : {show: true},
							dataView : {show: true, readOnly: false},
							magicType : {
								show: true,
								type: ['pie', 'funnel'],
								option: {
									funnel: {
										x: '25%',
										width: '50%',
										funnelAlign: 'left',
										max: 1548
									}
								}
							},
							restore : {show: true},
							saveAsImage : {show: true}
						}
					},
					calculable : true,
					series : [
						{
							name:'任务执行时长',
							type:'pie',
							radius : '55%',
							center: ['50%', '60%'],
							data:series
						}
					]
				};
				chart.setOption(option);
			};
			var legendData = [];
			(function(){
				scope.data.forEach(function (item) {
					legendData.push(map[item.name]);
					item.name = map[item.name];
				});
				initEchart(legendData,scope.data);
			})();
		}
	}
}]);
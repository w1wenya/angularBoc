/**
 * Created by Zhang Haijun on 2016/12/5.
 */
app.directive('ngGraphDashboradLineChart', [ function () {
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
						right: '20',
						top:'10%',
						bottom: '6%',
						containLabel: true
					},
					series : series
				};
				chart.setOption(option);
			}
			// var nameMap = {
			// 	RUNNING: '执行中',
			// 	SUCCESS: '成功',
			// 	FAIL: '失败',
			// 	CANCEL: '取消'
			// };
			// var colorMap = {
			// 	'RUNNING':'#00aeef',
			// 	'SUCCESS':'#27c24c',
			// 	'FAIL':'#f05050',
			// 	'CANCEL':'#fad733'
			// }
			var legendData = [],series = [];
			//数据处理
			(function () {
				scope.data.values.forEach(function (item) {
					legendData.push(item.name);
					series.push({
						name:item.name,
						type:'line',
						smooth:true,
						itemStyle: {
							normal: {
								areaStyle: {type: 'default'},
								// color:item.name,
								opacity:0.8
							}},
						data:item.data
					});
				});
				initEchart(scope.data.keys,legendData,series);
			})();
		}}
}]);
app.directive('ngGraphDashboradPieChart', [function () {
	return {
		restrict: 'EA',
		scope:{
			theme:'=',
			data:'='
		},
		link: function (scope, element, attrs) {
			var map = {
				RUNNING: '执行中',
				SUCCESS: '成功',
				FAIL: '失败',
				CANCEL: '取消'
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
							name:scope.theme,
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
					// legendData.push(map[item.name]);
					// item.name = map[item.name];
					legendData.push(item.name);
				});
				initEchart(legendData,scope.data);
			})();
		}
	}
}]);
app.directive('ngGraphDashboradBarChart', [ function () {
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
						right:20,
						feature : {
							mark : {show: true},
							dataView : {show: true, readOnly: false},
							restore : {show: true},
							saveAsImage : {show: true}
						}
					},
					xAxis : [
						{
							type : 'category',
							data : xAxis
						}
					],
					yAxis : [
						{
							type : 'value'
						}
					],
					grid: {
						left: '0%',
						right: '1%',
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
			var legendData = [];
			//数据处理
			(function () {
				var series = {
					name:"告警数量",
					type:'bar',
					data:scope.data.values
				};
				legendData = ['告警数量'];
				initEchart(scope.data.keys,legendData,series);
			})();
		}}
}]);
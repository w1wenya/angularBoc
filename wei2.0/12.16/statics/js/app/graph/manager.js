app.controller('ManagerGraphCtrl', ['$rootScope', '$scope', 'httpLoad','$state',function($rootScope, $scope, httpLoad,$state) {
	$rootScope.moduleTitle = '数据纵览 > 管理视图';
	var chart = echarts.init($('#graphMap')[0]);
	chart.on('click', function (params) {
		if(params.componentType == 'markPoint'){
			$state.go('app.graph.assetsview',{flag:1,id:params.data.dcId});
		}
	});
	var option = {
		backgroundColor: '#fff',
		tooltip: {
			trigger: 'item',
			formatter: '{b}'
		},
		geo: {
			map: 'china',
			label: {
				emphasis: {
					show: false
				}
			},
			roam: true,
			itemStyle: {
				normal: {
					areaColor: '#000',
					borderColor: '#111'
				},
				emphasis: {
					areaColor: '#2a333d'
				}
			}
		},
		series: [{
			name:'中国',
			type: 'map',
			roam: true,
			mapType: 'china',
			label: {
				normal: {
					show: true
				},
				emphasis: {
					show: true
				}
			},
			itemStyle:{
				normal: {
					areaColor: '#C3E77D'
				}
			},
			data: [],
			markPoint: {
				symbol: 'image://statics/img/dashborad/map_icon.png',
				symbolSize: 50,
				label: {
					normal: {
						show: false,
						color:'#333',
						formatter: function(d) {
							return d.name
						}
					}
				},
				data: []
			}
		}]
	};
	(function () {
		httpLoad.loadData({
			url: '/dc/list',
			method: 'POST',
			data:{
				page:1,
				rows:65536
			},
			noParam:true,
			success: function(data){
				if(data.success) {
					var listData = data.data.rows,datas = [];
					listData.forEach(function(item){
						datas.push({
							name: item.name,
							dcId:item.id,
							coord: item.coordinate.split(',')
						});
					});
					option.series[0].markPoint.data = datas;
					chart.setOption(option);
				}
			}
		});
	})();
}]);

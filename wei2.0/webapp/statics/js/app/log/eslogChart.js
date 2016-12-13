(function(){
	"use strict";
	app.controller('eslogchartCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','LANGUAGE',
		function($scope, httpLoad, $rootScope, $modal,$state, $timeout,LANGUAGE) {
			$rootScope.moduleTitle = '日志管理 > 日志分析';//定义当前页
			$rootScope.link = '/statics/css/measure.css';
			$scope.groupType = "timeGroup";
			
			//重置搜索条件
			$scope.reset = function(){
				var obj = ['date','groupType'];
				angular.forEach(obj,function(data){
					$scope.date  = $scope.dateChange($scope.dateAdd(dateNow,-6)) + " - " + $scope.dateChange(dateNow);	
					$scope.groupType = "timeGroup";
				});
			};
			
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
				if(m <= 9) m = "0"+m;
				if(d <= 9) d = "0"+d; 
				var cdate = y+"-"+m+"-"+d;
				return cdate;
			};			
		 
			var dateNow = new Date();
			$scope.date  = $scope.dateChange($scope.dateAdd(dateNow,-6)) + " - " + $scope.dateChange(dateNow);			
			
			$scope.showChart=function(result) {
				if(!result) {
					var xValue = ['X'];
					var yValue = [0];
					result = {xValues:xValue,yValues:yValue};
				}
				 var myChart = echarts.init(document.getElementById('main'));
			        // 指定图表的配置项和数据
			        var option = {
			            title: {
			                //text: '日志记录统计表'
			            },
			            tooltip: {},
			            legend: {
			                data:['日志条数']
			            },
			            toolbox: {
			                show : true,
			                feature : {
			                    mark : {show: true},
			                    dataView : {show: true, readOnly: false},
			                    magicType : {show: true, type: ['line', 'bar']},
			                    restore : {show: true},
			                    saveAsImage : {show: true}
			                }
			            },
			            calculable : true,
			            color:['green'],  
			            xAxis: {
			                data: eval(result.xValues)   // ["2016-10-21","2016-10-22","2016-10-23","2016-10-24","2016-10-25"]
			            },
			            yAxis: {},
			            series: [{
			                name: '日志条数',
			                type: 'bar',  //bar line
			                data: eval(result.yValues)  //[5, 20, 36, 10, 10]
			            }]
			        };
			        // 使用刚指定的配置项和数据显示图表。
			        myChart.setOption(option);
			};			
			
			$scope.param = {};
			$scope.getChartData = function(){
				httpLoad.loadData({
					url: '/logchart/eslog/eslogchart',
					data: $scope.param,
					noParam: true,
					success: function(data){
						if(data.success){
							$scope.showChart(data.data);
						}
						
					}
				});
			};
				
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
					groupType: $scope.groupType
				});				 
				params.push({param: param1, sign: 'EQ'});
				if ($scope.date) {
					params.push({param: {timestamp: toFormatTime($scope.date, 0)}, sign: 'GET'});
					params.push({param: {timestamp: toFormatTime($scope.date, 1)}, sign: 'LET'});
				}
				$scope.param = {
					params: angular.toJson(params)
				}
				$scope.getChartData();
			}
			$scope.search();
			
			//本周
			$scope.currWeek = function(){
				var dateNow = new Date();
				var weekDay = dateNow.getDay();
				if (0 == weekDay) {
					weekDay = 7;
				}
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,1-weekDay)) + " - " + $scope.dateChange(dateNow);
				$scope.search();
			}
			//上周
			$scope.preWeek = function(){
				var dateNow = new Date();
				var weekDay = dateNow.getDay();
				if (0 == weekDay) {
					weekDay = 7;
				}
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,-weekDay-6)) + " - " + $scope.dateChange($scope.dateAdd(dateNow,-weekDay));
				$scope.search();
			}
			
			//本月 本月的第一天到当前时间
			$scope.currMonth = function(){
				var dateNow = new Date();
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,1-dateNow.getDate())) + " - " + $scope.dateChange(dateNow);
				$scope.search();
			}   
			
			//上月  //new Date().getDay()
			$scope.preMonth = function(){
				var dateNow = new Date();
				var preMathDate = $scope.dateAdd(dateNow,-dateNow.getDate());
				$scope.date = $scope.dateChange($scope.dateAdd(preMathDate,1-preMathDate.getDate())) + " - " + $scope.dateChange(preMathDate);
				$scope.search();
			}
			
			//7天  //new Date().getDay()
			$scope.sevenDays= function(){
				var dateNow = new Date();
				var preMathDate = $scope.dateAdd(dateNow,-dateNow.getDate());
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,-6)) + " - " + $scope.dateChange(dateNow);
				$scope.search();
			}
		
			//15天 //new Date().getDay()
			$scope.fifteenDays = function(){
				var dateNow = new Date();
		        $scope.date = $scope.dateChange($scope.dateAdd(dateNow,-14)) + " - " + $scope.dateChange(dateNow);
				$scope.search();
			}
		
			//30天  //new Date().getDay()
			$scope.thirtyDays = function(){
				var dateNow = new Date();
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,-29)) + " - " + $scope.dateChange(dateNow);
				$scope.search();
			}		
		}
	]);
})();
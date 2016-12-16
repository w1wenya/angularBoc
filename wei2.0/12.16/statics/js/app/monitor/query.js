(function(){
    "use strict";
    app.controller('querymonitorCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '监控管理 > 监控查询';
            $rootScope.link = '/statics/css/monitor.css';
            //$scope.param = {
            //    rows: 10
            //};
            $scope.queryItem = {
                "host":"" ,
                "measurementType":"",
                "aggregation":"",
                "beginTime":"" ,
                "endTime":"" ,
                "interval":"",
                "label":"",
                "chartType":""
            };
            $scope.functionData = [{"value":"min","name":"min"},{"value":"max","name":"max"},{"value":"mean","name":"avg"}];
            $scope.timeData = [{"value":"s","name":"秒"},{"value":"m","name":"分钟"},{"value":"h","name":"小时"},{"value":"d","name":"天"}];
            $scope.typeData = [{"value":"line","name":"折线图"},{"value":"bar","name":"柱状图"}];
            $scope.type = "line";
            $scope.timeUnit = "s";
            $scope.datePicker = {};$scope.datePicker.date1;$scope.datePicker.date2;
            var today = new Date();
            $scope.dateRangeOptions = {
                timePicker: true,
                singleDatePicker: true,
                format: 'YYYY-MM-DD h:mm:ss A',
                maxDate:today
            };
            //处理时间
            var timeFormat = function(time){
                var arr = time.split(' '),val;
                if(arr[2]=='AM') val = arr[0]+ ' '+arr[1];
                if(arr[2]=='PM'){
                    var arr2 = arr[1].split(':');
                    var hour = parseInt(arr2[0])+12;
                    val = arr[0] + ' '+hour+':'+arr2[1]+':'+arr2[2];
                }
                return val;
            };
            //获取监控项数据
            httpLoad.loadData({
                url:'/monitor/getMeasurementTypes',
                method: 'POST',
                noParam: true,
                success:function(data){
                    if(data.success&&data.data){
                        $scope.itemData = data.data;
                    }
                }
            });
            //重置
            $scope.reset = function(){
                $scope.searchByIP = "";
                $scope.searchByMonitorItem = "";
                $scope.function = "";
                $scope.datePicker.date1 = "";$scope.datePicker.date2 = "";
                $scope.searchByTimeUnits = "";$scope.queryItem.interval = "";
                $scope.searchByTag = "";
                $scope.type = "";
            };
            $scope.change = function(index){
                if(index==0) $scope.queryItem.measurementType = $scope.searchByMonitorItem;
                if(index==1) $scope.queryItem.aggregation = $scope.function;
                if(index==2) $scope.queryItem.chartType = $scope.type;
            };
            //获取监控指标列表
            $scope.getData = function(page){
                $scope.isImageData = true;
                $scope.timeline = 5;
                //$scope.param.page = page || $scope.param.page;
                //var params = {
                //    page: $scope.param.page,
                //    rows: $scope.param.rows
                //};
                //var params = {};
                //var searchParam = [];
                if($scope.searchByIP&&$scope.searchByIP!=""){
                    $scope.queryItem.host = $scope.searchByIP;
                    //searchParam.push({"param":{"ip":$scope.searchByIP},"sign":"LK"});
                }else{
                    $scope.pop('请输入IP','error');
                    return;
                }
                if($scope.searchByMonitorItem!=undefined){
                    $scope.queryItem.measurementType = $scope.searchByMonitorItem;
                    //searchParam.push({"param":{"monitorItem":$scope.searchByMonitorItem},"sign":"LK"});
                }
                if($scope.function!=undefined){
                    $scope.queryItem.aggregation = $scope.function;
                    //searchParam.push({"param":{"function":$scope.function},"sign":"LK"});
                }
                if($scope.datePicker.date1!=undefined){
                    $scope.queryItem.beginTime = timeFormat($scope.datePicker.date1);
                    //searchParam.push({"param":{"time":toFormatTime($scope.datePicker.date1, 0)},"sign":"GET"});
                }
                if($scope.datePicker.date2!=undefined){
                    $scope.queryItem.endTime = timeFormat($scope.datePicker.date2);
                    //searchParam.push({"param":{"time":toFormatTime($scope.datePicker.date2, 1)},"sign":"LET"});
                }
                if($scope.searchByTimeUnits){
                    $scope.queryItem.interval = $scope.searchByTimeUnits + $scope.timeUnit;
                    //searchParam.push({"param":{"timeUnits":$scope.searchByTimeUnits},"sign":"LK"});
                }
                if($scope.searchByTag!=undefined){
                    $scope.queryItem.label = $scope.searchByTag;
                    //searchParam.push({"param":{"tag":$scope.searchByTag},"sign":"LK"});
                }
                if($scope.type!=undefined){
                    $scope.queryItem.chartType = $scope.type;
                    //searchParam.push({"param":{"type":$scope.type},"sign":"LK"});
                }
                //params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/monitor/query',
                    method: 'POST',
                    data: $scope.queryItem,
                    success:function(data){
                        if(data.success&&data.data){
                            $scope.queryData = data.data.values;
                            $scope.xAxis = data.data.xAxis;
                            $scope.name = data.data.name;
                        }
                    }
                });
            };
        }
    ]);
})();
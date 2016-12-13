angular.module('app').controller('detailRackMonitorModalCtrl', ['$rootScope', '$scope','$interval','$state','httpLoad','$stateParams',function($rootScope, $scope,$interval,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/monitor.css';
    $rootScope.moduleTitle = '监控中心 > 机柜监控';
    $scope.param = {
        rows: 10
    };
    $scope.timeline = 1;$scope.action = 1;$scope.useDaterangepicker = false;
    $scope.datePicker = {};$scope.datePicker.date;
    $scope.choose;
    var today = new Date();
    $scope.dateRangeOptions = {
        timePicker: true,
        format: 'YYYY-MM-DD h:mm:ss A',
        maxDate:today
    };
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
    $scope.type = "line";
    $scope.functionData = [{"value":"min","name":"最小值"},{"value":"max","name":"最大值"},{"value":"mean","name":"平均值"}];
    $scope.queryItem.aggregation = "max";

    $scope.getData = function(action){
        $scope.action = action;

        $scope.queryItem.id = $stateParams.id;var gapTime;
        if($scope.timeline!=6){
            if($scope.timeTicket) $interval.cancel($scope.timeTicket);
            //$scope.choose =false;
        }
        if(action!=5){
            $scope.datePicker = {};$scope.datePicker.date;
        }
        //对时间进行处理
        var toFormatTime = function(time, place) {
            if (!time) return "";
            var date = time.split(' - ');
            return date[place/1];
        };
        var timeFormat = function(time) {
            var arr = time.split(' '),val;
            if(arr[2]=='AM') val = arr[0]+ ' '+arr[1];
            if(arr[2]=='PM'){
                var arr2 = arr[1].split(':');
                var hour = parseInt(arr2[0])+12;
                val = arr[0] + ' '+hour+':'+arr2[1]+':'+arr2[2];
            }
            return val;
        };
        var getTime = function(time){
            var value = new Date(time);
            return value.getFullYear() + "-" + (value.getMonth() + 1) + "-" + value.getDate() + " " + value.getHours() + ":" + value.getMinutes() + ":" + value.getSeconds();
        };
        switch(action) {
            case 1:  //近1小时
                gapTime = 1*60*60*1000;
                $scope.queryItem.endTime = getTime(new Date().getTime());
                $scope.queryItem.beginTime = getTime(new Date().getTime() - gapTime);
                break;
            case 2:   //今天
                gapTime = 24*60*60*1000;
                $scope.queryItem.endTime = getTime(new Date().getTime());
                $scope.queryItem.beginTime = getTime(new Date().getTime() - gapTime);
                break;
            case 3:   //7天
                gapTime = 7*24*60*60*1000;
                $scope.queryItem.endTime = getTime(new Date().getTime());
                $scope.queryItem.beginTime = getTime(new Date().getTime() - gapTime);
                break;
            case 4:  //30天
                gapTime = 30*24*60*60*1000;
                $scope.queryItem.endTime = getTime(new Date().getTime());
                $scope.queryItem.beginTime = getTime(new Date().getTime() - gapTime);
                break;
            case 5:   //自定义
                if(!$scope.datePicker.date) return;
                $scope.queryItem.endTime = timeFormat(toFormatTime($scope.datePicker.date, 1));
                $scope.queryItem.beginTime = timeFormat(toFormatTime($scope.datePicker.date, 0));
                break;
            //case 6:   //动态
            //    gapTime = 60*1000;     //按10秒1个点
            //    $scope.queryItem.endTime = getTime(new Date().getTime());
            //    $scope.queryItem.beginTime = getTime(new Date().getTime() - gapTime);
            //    break;
        }

        httpLoad.loadData({
            url:'/monitor/rack/query',
            method:'POST',
            data: $scope.queryItem,
            success:function(data){
                console.log($scope.queryItem);
                if(data.success&&data.data){
                    $scope.hostmonitorDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;

                    //if(action==6){
                    //    $scope.dynamicData = data.data;
                    //比较时间是否有重复的，有几十秒时间的重复数据
                    //var xData = [];
                    //for(var i=0;i<$scope.dynamicData.xAxis.length;i++){
                    //    if($scope.dynamicData.xAxis[i]>$scope.xAxis[$scope.xAxis.length-1]){
                    //        xData.push($scope.dynamicData.xAxis[i]);
                    //        angular.forEach($scope.dynamicData.values, function(data,a){
                    //            angular.forEach($scope.dynamicData.values[a].data, function(data,b){
                    //                var yData = [];
                    //                yData.push($scope.dynamicData.values[a].data[b].yAxis[i]);
                    //                $scope.dynamicData.values[a].data[b].yAxis = yData;
                    //            });
                    //        });
                    //    }
                    //}
                    //$scope.dynamicData.xAxis = xData;
                    //去除了重复的数据后再来处理
                    //for(var i=0;i<$scope.dynamicData.xAxis.length;i++){
                    //    $scope.xAxis.shift();
                    //    $scope.xAxis.push($scope.dynamicData.xAxis[i]);
                    //    angular.forEach($scope.queryData, function(data,index){
                    //        var a = index;
                    //        angular.forEach($scope.queryData[a].data, function(data,index){
                    //            var b = index;
                    //            $scope.queryData[a].data[b].yAxis.shift();
                    //            $scope.queryData[a].data[b].yAxis.push($scope.dynamicData.values[a].data[b].yAxis[i]);
                    //        });
                    //    });
                    //}
                    //}else{
                    $scope.xAxis = data.data.xAxis;
                    $scope.queryData = data.data.values;
                    //}
                }
            }
        });
    };
    $scope.getData(1);

    //选择时间间隔
    $scope.setInterval = function(action){
        if($scope.choose==true){
            $scope.action = action;
            if($scope.timeTicket) $interval.cancel($scope.timeTicket);  //关闭按钮
            $scope.move($scope.choose);
        }
        else $scope.getData(action);
    };
    //选择自定义时间
    $scope.$watch('datePicker.date', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.setInterval(5);
        }
    }, true);
    //动态数据
    $scope.move = function(choose){
        $scope.choose = choose;
        if(choose){
            //$scope.getData(1);
            if($scope.action==5) $scope.action=1;
            $scope.timeline = 6;
            $scope.datePicker = {};$scope.datePicker.date;$scope.useDaterangepicker = true;
            //如果是近1小时，传时间单位10s;其他的是默认时间单位
            if($scope.action==1) $scope.queryItem.interval = "10s";
            else $scope.queryItem.interval = "";
            $scope.timeTicket = $interval(function () {
                $scope.getData($scope.action);
            }, 30*1000);
        }else{
            //$scope.timeline = 1;
            $scope.useDaterangepicker = false;
            $scope.queryItem.interval = "";
            if($scope.timeTicket) $interval.cancel($scope.timeTicket);  //关闭按钮
            $scope.getData($scope.action);
        }
    };

    $scope.$on("$destroy", function(event) {
        $interval.cancel($scope.timeTicket);
    });
    $scope.goBack = function(){
        $state.go('app.monitor.rack');
    };
}]);
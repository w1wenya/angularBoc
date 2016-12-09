(function(){
    app.controller('analysisCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '监控管理 > 监控分析';//定义当前页
            $rootScope.link = '/statics/css/monitor.css';
            //if(localStorage.getItem('grouptabLocation')!=null){
            //    var grouptabLocation = JSON.parse(localStorage.getItem('grouptabLocation'));
            //    if(!grouptabLocation){
            //        $scope.active1 = true;
            //    } else{
            //        if(grouptabLocation.indexOf("user")>=0) $scope.active1 = true;
            //        else $scope.active2 = true;
            //    }
            //}else{
            //    $scope.active1 = true;$scope.active2 = false;
            //}
        }
    ]);
    app.controller('trendCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$window',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$window) {
            //$rootScope.link = '/statics/css/monitor.css';
            //$scope.param = {
            //    rows: 10
            //};
            $scope.isShowBtn = true;
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
                    $scope.queryItem.isTrend = "true";
                    //searchParam.push({"param":{"type":$scope.type},"sign":"LK"});
                }
                //params.params = JSON.stringify(searchParam);
                $scope.queryItem.chartType =
                httpLoad.loadData({
                    url:'/monitor/query',
                    method: 'POST',
                    data: $scope.queryItem,
                    success:function(data){
                        if(data.success&&data.data){
                            $scope.queryData = data.data.values;
                            $scope.xAxis = data.data.xAxis;
                            $scope.name = data.data.name;

                            $scope.isShowBtn = false;
                        }
                    }
                });
            };
            //导出--默认报表
            $scope.exportTrigger = function($event){
                $event.stopPropagation();
                if(!$scope.excelUuid||$scope.excelUuid=="") return;
                var params = {"excelUuid":$scope.excelUuid};
                document.getElementById("analysisexport1").setAttribute("src","/monitor/report/export?params="+angular.toJson(params));
                //httpLoad.loadData({
                //    url:'/monitor/report/export',
                //    method:'POST',
                //    data: params,
                //    noParam: true,
                //    success:function(data){
                //        if(data.success){
                //            //导出链接从data返回
                //            var tempwindow = $window.open('_blank');
                //            tempwindow.location = data.data;
                //        }
                //    }
                //});
            };
        }
    ]);
    app.controller('defaultCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$window',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$window) {
            $rootScope.link = '/statics/css/monitor.css';
            $scope.param = {
                rows: 10
            };
            $scope.searchData = {
                "dcId":"" ,
                "roomId":"" ,
                "rackId":"" ,
                "serverId":"" ,
                "vmId":"" ,
                "measurementType":"",
                "beginTime":"" ,
                "endTime":"" ,
                "interval":""
            };
            $scope.timeData = [{"value":"s","name":"秒"},{"value":"m","name":"分钟"},{"value":"h","name":"小时"},{"value":"d","name":"天"}];
            $scope.timeUnit = "s";
            $scope.datePicker = {};$scope.datePicker.date;
            var today = new Date();
            $scope.dateRangeOptions = {
                timePicker: true,
                format: 'YYYY-MM-DD h:mm:ss A',
                maxDate:today
            };
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
            //数据中心/机房/机柜/主机/虚拟机数据
            $scope.getlistData = function(){
                var params = {
                    simple:true
                };
                httpLoad.loadData({
                    url:'/dc/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.datacenterList = data.data.rows;
                        }
                    }
                });
                httpLoad.loadData({
                    url:'/room/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.roomList = data.data.rows;
                        }
                    }
                });
                httpLoad.loadData({
                    url:'/rack/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.rackList = data.data.rows;
                        }
                    }
                });
                httpLoad.loadData({
                    url:'/server/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.serverList = data.data.rows;
                        }
                    }
                });
                httpLoad.loadData({
                    url:'/vm/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.vmList = data.data.rows;
                        }
                    }
                });
            };
            $scope.getlistData();
            //if(localStorage.getItem('grouptabLocation')!=null){
            //    var grouptabLocation = JSON.parse(localStorage.getItem('grouptabLocation'));
            //    if(grouptabLocation.indexOf("user")>=0) $scope.getData(1);
            //}else{
            //    $scope.getData();
            //}
            //重置
            $scope.reset = function(){
                $scope.searchData.dcId = "";
                $scope.searchData.roomId = "";
                $scope.searchData.rackId = "";
                $scope.searchData.serverId = "";
                $scope.searchData.vmId = "";
                $scope.searchData.measurementType = "";
                $scope.datePicker.date = "";
                $scope.searchByTimeUnits = "";
            };
            //获取监控指标列表
            $scope.isImageData = true;
            $scope.getData = function(page){
                if($scope.searchData.dcId==""&&$scope.searchData.roomId==""&&$scope.searchData.rackId==""&&$scope.searchData.serverId==""&&$scope.searchData.vmId==""){
                    $scope.pop('在数据中心、机房、机柜、主机、虚拟机中，请至少选择一个','error');
                    return;
                }
                if($scope.datePicker.date!=undefined){
                    if($scope.datePicker.date!=""){
                        $scope.searchData.endTime = timeFormat(toFormatTime($scope.datePicker.date, 1));
                        $scope.searchData.beginTime = timeFormat(toFormatTime($scope.datePicker.date, 0));
                    }else{
                        $scope.searchData.endTime = "";
                        $scope.searchData.beginTime = "";
                    }
                }
                if($scope.searchByTimeUnits){
                    $scope.searchData.interval = $scope.searchByTimeUnits + $scope.timeUnit;
                }

                $scope.param.page = page || $scope.param.page;
                //var params = {
                //    page: $scope.param.page,
                //    rows: $scope.param.rows
                //},
                //searchParam = $scope.searchData;
                //if($scope.searchByName&&$scope.searchByName!=""){
                //    searchParam.push({"param":{"name":$scope.searchByName},"sign":"EQ"});
                //}
                //params.params = JSON.stringify(searchParam);
                $scope.searchData.page = $scope.param.page;
                $scope.searchData.rows = $scope.param.rows;
                httpLoad.loadData({
                    url:'/monitor/report/list',
                    method: 'POST',
                    data: $scope.searchData,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.excelUuid = data.data.excelUuid;
                            $scope.defaultData = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            //导出--默认报表
            $scope.exportTrigger = function($event){
                $event.stopPropagation();
                if(!$scope.excelUuid||$scope.excelUuid=="") return;
                var params = {"excelUuid":$scope.excelUuid};
                document.getElementById("analysisexport").setAttribute("src","/monitor/report/export?params="+angular.toJson(params));
                //httpLoad.loadData({
                //    url:'/monitor/report/export',
                //    method:'POST',
                //    data: params,
                //    noParam: true,
                //    success:function(data){
                //        if(data.success){
                //            //导出链接从data返回
                //            var tempwindow = $window.open('_blank');
                //            tempwindow.location = data.data;
                //        }
                //    }
                //});
            };
        }
    ]);
})();
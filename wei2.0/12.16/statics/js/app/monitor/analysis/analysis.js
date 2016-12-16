(function(){
    app.controller('analysisCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '监控管理 > 监控分析';//定义当前页
            $rootScope.link = '/statics/css/monitor.css';
        }
    ]);
    app.controller('trendCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$window',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$window) {
            //$rootScope.link = '/statics/css/monitor.css';
            $scope.isShowBtn = true;

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
            $scope.type = "line";
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

            //数据中心/机房/机柜/主机/虚拟机数据,获取监控项数据
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
            };
            $scope.getlistData();
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
            $scope.getData1 = function(page){
                $scope.isImageData = true;
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
                $scope.searchData.isTrend = "true";

                httpLoad.loadData({
                    url:'/monitor/queryTrend',
                    method: 'POST',
                    data: $scope.searchData,
                    success:function(data){
                        if(data.success&&data.data){
                            $scope.queryData = data.data.values;
                            $scope.xAxis = data.data.xAxis;
                            $scope.name = data.data.name;

                            angular.forEach($scope.queryData, function(data,index) {
                                var trendTxt = data.trendInfo.split('&');
                                data.trendTxt = [];
                                for(var i=0;i<trendTxt.length;i++){
                                    if(i!=0&&i!=1) {
                                        var a = trendTxt[i].indexOf(':');
                                        var name = trendTxt[i].substr(0,a-1);
                                        var b = trendTxt[i].substr(a+1,trendTxt[i].length);
                                        //var c = b.split('，');
                                        //for(var j=0;j< c.length;c++){
                                        //    var d = c[j].split(':');
                                        //    if(d[0]=='最大') var max = d[1];
                                        //    if(d[0]=='最小') var min = d[1];
                                        //    if(d[0]=='平均值') var avg = d[1];
                                        //}
                                        //data.trendTxt.push({"name":name,"max":max,"min":min,"avg":avg});
                                        data.trendTxt.push({"name":name,"txt":b});
                                    }
                                }
                            });
                            $scope.isShowBtn = false;
                        }else{
                            $scope.isShowBtn = true;
                        }
                    }
                });
            };
            //导出--默认报表
            $scope.exportTrigger1 = function($event){
                $event.stopPropagation();
                //if(!$scope.excelUuid||$scope.excelUuid=="") return;
                //var params = {"excelUuid":$scope.excelUuid};
                var params = $scope.searchData;
                document.getElementById("analysisexport1").setAttribute("src","/monitor/report/trend?params="+angular.toJson(params));
                //httpLoad.loadData({
                //    url:'/monitor/report/export',
                //    method:'POST',
                //    data: params,
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
            //数据中心/机房/机柜/主机/虚拟机数据,获取监控项数据
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
            };
            $scope.getlistData();
            //if(sessionStorage.getItem('grouptabLocation')!=null){
            //    var grouptabLocation = JSON.parse(sessionStorage.getItem('grouptabLocation'));
            //    if(grouptabLocation.indexOf("user")>=0) $scope.getData1(1);
            //}else{
            //    $scope.getData1();
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
            $scope.isImageData2 = true;
            $scope.getData2 = function(page){
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
                            $scope.isImageData2 = false;
                        }else{
                            $scope.isImageData2 = true;
                        }
                    }
                });
            };
            //导出--默认报表
            $scope.exportTrigger2 = function($event){
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
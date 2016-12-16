(function(){
    "use strict";
    app.controller('mResourceCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','LANGUAGE',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,LANGUAGE) {
            $rootScope.moduleTitle = '监控管理 > 资源监控';//定义当前页
            //$rootScope.link = '/statics/css/tree-control.css';//引入页面样式
            $scope.param = {
                rows: 10,
                page:1
            };
            //树形结构
            $scope.treeOptions = {
                nodeChildren: "children",
                dirSelectable: true,
                injectClasses: {
                    ul: "a1",
                    li: "a2",
                    liSelected: "a7",
                    iExpanded: "a3",
                    iCollapsed: "a4",
                    iLeaf: "a5",
                    label: "a6",
                    labelSelected: "a8"
                }
            };
            $scope.expandedNodes = [];
            $scope.selectNode = function(node) {
                $scope.selected = node;
            };
            //获取树形菜单数据
            $scope.getTreeData = function(actionName){
                var params = {
                    sign:""
                };
                if($scope.searchByName&&$scope.searchByName!=""){
                    params.sign = $scope.searchByName;
                }
                httpLoad.loadData({
                    url:'/monitor/queryEquipmentAllType',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success: function(data){
                        if(data.success&&data.data){
                            $scope.dataForTheTree = data.data;
                            angular.forEach($scope.dataForTheTree, function(data,index){
                                data.action = 1;
                                $scope.expandedNodes.push(data);
                                if(data.children&&data.children.length>0){
                                    angular.forEach(data.children, function(data1,index1){
                                        data1.action = 2;
                                        $scope.expandedNodes.push(data1);
                                        if(data1.children&&data1.children.length>0){
                                            angular.forEach(data1.children, function(data2,index2) {
                                                data2.action = 3;
                                                $scope.expandedNodes.push(data2);
                                            });
                                        }
                                    });
                                }
                            });

                            if(actionName== 0){
                                //如果是查询，默认选中
                                for(var i=0;i<$scope.dataForTheTree.length;i++){
                                    if($scope.dataForTheTree[i].children&&$scope.dataForTheTree[i].children.length>0){
                                        for(var j=0;j<$scope.dataForTheTree[i].children.length;j++){
                                            if($scope.dataForTheTree[i].children[j].children&&$scope.dataForTheTree[i].children[j].children.length>0){
                                                for(var k=0;k<$scope.dataForTheTree[i].children[j].children.length;k++){
                                                    if(k == 0) {
                                                        $scope.selectNode($scope.dataForTheTree[i].children[j].children[k]);
                                                        return false;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                        }
                    }
                });
            };
            $scope.getTreeData();

            $scope.isImageData = true;
            $scope.getData = function(page,node){
                if(node) {
                    if(node.action!=3) return;
                    else $scope.node = node;
                }
                $scope.param.page = page || $scope.param.page;

                var params = {};
                var searchParam = $scope.node;
                searchParam.page = $scope.param.page;
                searchParam.rows = $scope.param.rows;
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/monitor/queryEquipment',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        console.log(params);
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.commandList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                        }else{
                            $scope.isImageData = true;
                        }

                        var resLocation = {
                            page: $scope.param.page,
                            location:'resource',
                            node:$scope.node
                        };
                        sessionStorage.resLocation = JSON.stringify(resLocation);
                    }
                });
            };

            //返回当前页面时
            if(sessionStorage.resLocation){
                var resLocation = JSON.parse(sessionStorage.resLocation);
                if(resLocation&&resLocation.location.indexOf("detail")>=0) {
                    if(sessionStorage.resMonitorData&&sessionStorage.resMonitorData!=""){
                        $scope.getTreeData();
                        $scope.selectNode(JSON.parse(sessionStorage.resLocation).node);
                        $scope.getData(resLocation.page,JSON.parse(sessionStorage.resLocation).node);
                    }
                }else{
                    $scope.getTreeData();
                }
            }else {
                $scope.getTreeData();
            }

            //监控
            $scope.goMonitor = function(node){
                $state.go('app.monitor.roomMonitor');
                var resMonitorData = node;
                sessionStorage.resMonitorData = JSON.stringify(resMonitorData);
            }
            //$scope.detail = function($event,$index,row,key){
            //    //$scope.getDataList(1,row.id);
            //    var modalInstance = $modal.open({
            //        templateUrl : '/statics/tpl/monitor/resource/monitor.html',
            //        controller : 'detailResourcceModalCtrl',
            //        size : 'lg',
            //        resolve : {
            //            row : function(){
            //                return row;
            //            }
            //        }
            //    });
            //    modalInstance.result.then(function(){
            //    },function(){});
            //};
        }
    ]);
    //angular.module('app').controller('detailResourcceModalCtrl',['$scope','$modalInstance','httpLoad','$stateParams','$interval','$rootScope','row',
    //    function($scope,$modalInstance,httpLoad,$stateParams,$interval,$rootScope,row){ //依赖于modalInstance
    //        $rootScope.link = '/statics/css/monitor.css';
    //        //$scope.queryData = queryData;$scope.xAxis = xAxis;$scope.hostmonitorDetail = hostmonitorDetail;
    //
    //        $scope.timeline = 1;$scope.action = 1;$scope.type = "line";
    //        $scope.useDaterangepicker = false;
    //        $scope.datePicker = {};$scope.datePicker.date;
    //        $scope.choose;
    //        var today = new Date();
    //        $scope.dateRangeOptions = {
    //            timePicker: true,
    //            format: 'YYYY-MM-DD h:mm:ss A',
    //            maxDate:today
    //        };
    //        var interval = row.interval+'s';
    //        $scope.queryItem = {
    //            "ip":row.ip,
    //            "measurementType":row.measurement,
    //            "type":"",
    //            "category":"",
    //            "aggregation":"",
    //            "beginTime":"" ,
    //            "endTime":"" ,
    //            "interval":row.interval
    //        };
    //
    //        $scope.getData = function(action){
    //            $scope.action = action;
    //
    //            var gapTime;
    //            if($scope.timeline!=6){
    //                if($scope.timeTicket) $interval.cancel($scope.timeTicket);
    //                //$scope.choose =false;
    //            }
    //            if(action!=5){
    //                $scope.datePicker = {};$scope.datePicker.date;
    //            }
    //            //对时间进行处理
    //            var toFormatTime = function(time, place) {
    //                if (!time) return "";
    //                var date = time.split(' - ');
    //                return date[place/1];
    //            };
    //            var timeFormat = function(time) {
    //                var arr = time.split(' '),val;
    //                if(arr[2]=='AM') val = arr[0]+ ' '+arr[1];
    //                if(arr[2]=='PM'){
    //                    var arr2 = arr[1].split(':');
    //                    var hour = parseInt(arr2[0])+12;
    //                    val = arr[0] + ' '+hour+':'+arr2[1]+':'+arr2[2];
    //                }
    //                return val;
    //            };
    //            var getTime = function(time){
    //                var value = new Date(time);
    //                return value.getFullYear() + "-" + (value.getMonth() + 1) + "-" + value.getDate() + " " + value.getHours() + ":" + value.getMinutes() + ":" + value.getSeconds();
    //            };
    //            switch(action) {
    //                case 1:  //近1小时
    //                    gapTime = 1*60*60*1000;
    //                    $scope.queryItem.endTime = getTime(new Date().getTime());
    //                    $scope.queryItem.beginTime = getTime(new Date().getTime() - gapTime);
    //                    break;
    //                case 2:   //今天
    //                    gapTime = 24*60*60*1000;
    //                    $scope.queryItem.endTime = getTime(new Date().getTime());
    //                    $scope.queryItem.beginTime = getTime(new Date().getTime() - gapTime);
    //                    break;
    //                case 3:   //7天
    //                    gapTime = 7*24*60*60*1000;
    //                    $scope.queryItem.endTime = getTime(new Date().getTime());
    //                    $scope.queryItem.beginTime = getTime(new Date().getTime() - gapTime);
    //                    break;
    //                case 4:  //30天
    //                    gapTime = 30*24*60*60*1000;
    //                    $scope.queryItem.endTime = getTime(new Date().getTime());
    //                    $scope.queryItem.beginTime = getTime(new Date().getTime() - gapTime);
    //                    break;
    //                case 5:   //自定义
    //                    if(!$scope.datePicker.date) return;
    //                    $scope.queryItem.endTime = timeFormat(toFormatTime($scope.datePicker.date, 1));
    //                    $scope.queryItem.beginTime = timeFormat(toFormatTime($scope.datePicker.date, 0));
    //                    break;
    //                //case 6:   //动态
    //                //    gapTime = 60*1000;     //按10秒1个点
    //                //    $scope.queryItem.endTime = getTime(new Date().getTime());
    //                //    $scope.queryItem.beginTime = getTime(new Date().getTime() - gapTime);
    //                //    break;
    //            }
    //
    //            httpLoad.loadData({
    //                url:'/monitor/chart/view',
    //                method:'POST',
    //                data: $scope.queryItem,
    //                success:function(data){
    //                    if(data.success&&data.data){
    //                        console.log($scope.queryItem);
    //                        $scope.hostmonitorDetail = data.data;
    //                        $scope.showDetail = $scope.isActive = true;
    //                        $scope.xAxis = data.data.xAxis;
    //                        $scope.queryData = data.data.values;
    //                    }
    //                }
    //            });
    //        };
    //        $scope.getData(1);
    //
    //        //选择时间间隔
    //        $scope.setInterval = function(action){
    //            if($scope.choose==true){
    //                $scope.action = action;
    //                if($scope.timeTicket) $interval.cancel($scope.timeTicket);  //关闭按钮
    //                $scope.move($scope.choose);
    //            }
    //            else $scope.getData(action);
    //        };
    //        //选择自定义时间
    //        $scope.$watch('datePicker.date', function(newVal, oldVal) {
    //            if (newVal !== oldVal) {
    //                $scope.setInterval(5);
    //            }
    //        }, true);
    //        //动态数据
    //        $scope.move = function(choose){
    //            $scope.choose = choose;
    //            if(choose){
    //                if($scope.action==5) $scope.action=1;
    //                $scope.timeline = 6;
    //                $scope.datePicker = {};$scope.datePicker.date;$scope.useDaterangepicker = true;
    //                //如果是近1小时，传时间单位10s;其他的是默认时间单位
    //                if($scope.action==1) $scope.queryItem.interval = "10s";
    //                else $scope.queryItem.interval = "";
    //                $scope.timeTicket = $interval(function () {
    //                    $scope.getData($scope.action);
    //                }, 30*1000);
    //            }else{
    //                //$scope.timeline = 1;
    //                $scope.useDaterangepicker = false;
    //                $scope.queryItem.interval = "";
    //                if($scope.timeTicket) $interval.cancel($scope.timeTicket);  //关闭按钮
    //                $scope.getData($scope.action);
    //            }
    //        };
    //
    //        $scope.$on("$destroy", function(event) {
    //            $interval.cancel($scope.timeTicket);
    //        });
    //        $scope.cancel = function(){
    //            $modalInstance.dismiss('cancel'); // 退出
    //        };
    //    }]);
})();
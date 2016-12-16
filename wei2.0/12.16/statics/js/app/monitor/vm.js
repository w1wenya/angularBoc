(function(){
    "use strict";
    app.controller('VmCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '监控中心 > 虚机监控';//定义当前页
            $scope.param = {
                rows: 10
            };
            //获取云主机列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                if($scope.searchByStatus&&$scope.searchByStatus!=""){
                    searchParam.push({"param":{"status":$scope.searchByStatus},"sign":"EQ"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/vm/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success){
                            if(data.data){
                                $scope.vmList = data.data.rows;
                                $scope.totalCount = data.data.total;
                                $scope.isImageData = false;
                                angular.forEach($scope.vmList, function(data,index){
                                    //状态处理
                                    if(data.status=="paused"){
                                        data.statusColor = "warning";
                                        data.isStart = true;data.start = false;
                                        data.isActive = true;data.active = true;
                                        data.isStop = false;data.isPaused = false;
                                    }else if(data.status=="suspended"){
                                        data.statusColor = "primary";
                                        data.isActive = true;data.active = false;
                                        data.isStart = true;data.start = true;
                                        data.isStop = false;data.isPaused = false;
                                    }else if(data.status=="active"){
                                        data.statusColor = "info";
                                        data.isStop = true;data.isPaused = true;
                                        data.isStart = false;data.active = false;data.start = false;
                                    }else if(data.status=="poweredOn"){
                                        data.statusColor = "success";
                                        data.isPowerOn = false;data.isPowerOff = true;
                                        data.isPaused = true;
                                        data.isStart = false;data.isStop = false;
                                    }else if(data.status=="poweredOff"){
                                        data.statusColor = "danger";
                                        data.isPowerOn = true;data.isPowerOff = false;
                                        data.isStart = false;data.isStop = false;
                                    }else{
                                        data.statusColor = "default";
                                        data.isActive = true;data.active = true;
                                        data.isStart = true;data.start = true;
                                        data.isStop = false;data.isPaused = false;
                                    }
                                    //密码处理
                                    //var password = '';
                                    //for(var i=0;i<data.password.length;i++){
                                    //    password +='*';
                                    //}
                                    //data.password = password;
                                });
                            }
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            $scope.getData(1);
            //状态数据
            $scope.statusData = [{"value":"RUNNING","name":"运行中"},{"value":"RESTARTING","name":"重启中"},{"value":"CLOSED","name":"已关闭"}];
            //重置搜索条件
            $scope.reset = function(){
                var obj = ['searchByName','searchByStatus'];
                angular.forEach(obj,function(data){
                    $scope[data] = '';
                })
            };
            //返回
            $scope.goBack = function(){
                $scope.isActive = false;
                $timeout(function() {
                    $scope.showDetail = false;
                }, 200);
            };
            //监控
            $scope.goMonitor = function(id){
                $state.go('app.monitor.vmMonitor',{id:id})
            }
            $scope.showPassword = function(value){
                $scope[value] = !$scope[value];
            };
        }
    ]);
})();
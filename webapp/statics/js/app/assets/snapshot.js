(function(){
    "use strict";
    app.controller('snapshotCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '资源中心 > 快照管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            //获取快照管理列表
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
                if($scope.searchByVolumeName&&$scope.searchByVolumeName!=""){
                    searchParam.push({"param":{"volumeName":$scope.searchByVolumeName},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/snapshot/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.snapshotList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            $scope.getData(1);
            //新增
            $scope.add = function($event,size){
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/snapshot/add.html',
                    controller : 'addSnapshotModalCtrl',
                    size : size
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //删除
            $scope.remove = function(id,$event,$index,key){
                if($event) $event.stopPropagation();
                $scope.removeData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/snapshot/remove.html',
                    controller : 'removeSnapshotModalCtrl',
                    resolve : {
                        removeData : function(){
                            return $scope.removeData;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //同步
            $scope.sync = function($event,row,size){
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/snapshot/sync.html',
                    controller : 'syncSnapshotModalCtrl',
                    size : size,
                    resolve : {
                        item : function(){
                            return $scope.row;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //跳转详情页
            $scope.detail = function(id,$event){
                //$event.stopPropagation();
                $state.go('app.assets.snapshotDetail',{id:id});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addSnapshotModalCtrl',['$scope','$modalInstance','httpLoad',
        function($scope,$modalInstance,httpLoad){ //依赖于modalInstance
            $scope.addData = {};
            $scope.param = {
                rows: 6
            };
            //获取快设备数据
            httpLoad.loadData({
                url:'/volume/list',
                method:'POST',
                data: {simple : true},
                noParam: true,
                success:function(data){
                    if(data.success){
                        $scope.volumeData = data.data.rows;
                    }
                }
            });
            //获取数据
            $scope.getVmSource = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                    page: $scope.param.page,
                    rows: $scope.param.rows
                };
                httpLoad.loadData({
                    url:'/cloudVendor/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success){
                            if(data.data){
                                $scope.cloudVendorList = data.data.rows;
                                $scope.totalCount1 = data.data.total;
                                angular.forEach($scope.cloudVendorList, function(data,index){
                                    data.isSelected = false;
                                });
                            }
                        }
                    }
                });
            };
            $scope.getVmSource(1);
            //获取可用区域数据
            $scope.getRegion = function(id){
                httpLoad.loadData({
                    url:'/cloudVendor/region',
                    method: 'POST',
                    data: {"value":"region","vendorId":$scope.addData.id},
                    success:function(data){
                        if(data.success){
                            if(data.data){
                                $scope.regionData = data.data;
                                angular.forEach($scope.regionData, function(data,index){
                                    data.isRegionActive = false;
                                });
                            }
                        }
                    }
                });
            };
            //选择
            $scope.selectvmSource = function(row){
                $scope.addData.id = row.id;
                $scope.getRegion(row.id);
            };
            //选择可用区域
            $scope.chooseRegion = function(item){
                angular.forEach($scope.regionData, function(data,index){
                    data.isRegionActive = false;
                    if(data.id==item.id){
                        data.isRegionActive = !item.isRegionActive;
                    }
                    if(data.isRegionActive){
                        $scope.addData.region = data.id;
                    }
                });
            };
            $scope.ok = function(){
                if(!$scope.addData.id){
                    $scope.pop('请选择需要同步的云账户','error');
                    return;
                }
                if(!$scope.addData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                httpLoad.loadData({
                    url:'/snapshot/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('快照新增成功');
                            $modalInstance.close();
                        }
                    }
                });

            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    //删除ctrl
    angular.module('app').controller('removeSnapshotModalCtrl',['$scope','$modalInstance','httpLoad','removeData',
        function($scope,$modalInstance,httpLoad,removeData){ //依赖于modalInstance
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/snapshot/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('快照删除成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    //同步ctrl
    angular.module('app').controller('syncSnapshotModalCtrl',['$scope','$modalInstance','httpLoad','item',
        function($scope,$modalInstance,httpLoad,item){
            $scope.syncData = {};
            $scope.param = {
                rows: 6
            };
            $scope.getVmSource = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                    page: $scope.param.page,
                    rows: $scope.param.rows
                };
                httpLoad.loadData({
                    url:'/cloudVendor/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success){
                            if(data.data){
                                $scope.cloudVendorList = data.data.rows;
                                $scope.totalCount1 = data.data.total;
                                angular.forEach($scope.cloudVendorList, function(data,index){
                                    data.isSelected = false;
                                });
                            }
                        }
                    }
                });
            };
            $scope.getVmSource(1);
            //获取可用区域数据
            $scope.getRegion = function(id){
                httpLoad.loadData({
                    url:'/cloudVendor/region',
                    method: 'POST',
                    data: {"value":"region","vendorId":$scope.syncData.id},
                    success:function(data){
                        if(data.success){
                            if(data.data){
                                $scope.regionData = data.data;
                                angular.forEach($scope.regionData, function(data,index){
                                    data.isRegionActive = false;
                                });
                            }
                        }
                    }
                });
            };
            //选择
            $scope.selectvmSource = function(row){
                $scope.syncData.id = row.id;
                $scope.getRegion(row.id);
            };
            //选择可用区域
            $scope.chooseRegion = function(item){
                angular.forEach($scope.regionData, function(data,index){
                    data.isRegionActive = false;
                    if(data.id==item.id){
                        data.isRegionActive = !item.isRegionActive;
                    }
                    if(data.isRegionActive){
                        $scope.syncData.region = data.id;
                    }
                });
            };
            $scope.ok = function(){
                if(!$scope.syncData.id){
                    $scope.pop('请选择需要同步的云账户','error');
                    return;
                }
                if(!$scope.syncData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                httpLoad.loadData({
                    url:'/snapshot/sync',
                    method:'POST',
                    data: $scope.syncData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('快照同步成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            };
        }]);
})();
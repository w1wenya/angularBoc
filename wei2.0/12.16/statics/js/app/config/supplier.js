(function(){
    "use strict";
    app.controller('supplierCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','LANGUAGE',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,LANGUAGE) {
            $rootScope.moduleTitle = '参数管理 > 平台管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            //获取云供应商列表
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
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/cloudVendor/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            //console.log(params);
                            $scope.supplierList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                            angular.forEach($scope.supplierList, function(data,index){
                                if(data.isLocked){
                                    data.isfreeze=false;
                                    data.isthaw=true;
                                }else{
                                    data.isfreeze=true;
                                    data.isthaw=false;
                                }
                            });
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            $scope.getData(1);

            //添加
            $scope.add = function($event){
                $state.go('app.config.cloudVendorAdd');
            };
            //编辑
            $scope.update = function($event,$index,row,key,size){
                $state.go('app.config.cloudVendorUpdate',{id:row.id});
            };
            //删除
            $scope.remove = function(id,$event,$index,key){
                if($event) $event.stopPropagation();
                $scope.removeData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/supplier/remove.html',
                    controller : 'removeSupplierModalCtrl',
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
            //冻结
            $scope.freeze = function($event,id){
                $event.stopPropagation();
                $scope.freezeData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/supplier/freeze.html',
                    controller : 'freezeSupplierModalCtrl',
                    resolve : {
                        freezeData : function(){
                            return $scope.freezeData;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //解冻
            $scope.thaw = function($event,id){
                $event.stopPropagation();
                $scope.thawData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/supplier/thaw.html',
                    controller : 'thawSupplierModalCtrl',
                    resolve : {
                        thawData : function(){
                            return $scope.thawData;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //返回
            $scope.goBack = function(){
                $scope.isActive = false;
                $timeout(function() {
                    $scope.showDetail = false;
                }, 200);
            };
            //跳转详情页
            $scope.detail = function(id,$event){
                $state.go('app.config.cloudVendorDetail',{id:id});
            };
        }
    ]);
    //删除ctrl
    angular.module('app').controller('removeSupplierModalCtrl',['$scope','$modalInstance','httpLoad','removeData',
        function($scope,$modalInstance,httpLoad,removeData){
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/cloudVendor/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            //console.log(removeData);
                            $scope.pop('平台删除成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            };
        }]);
    //冻结ctrl
    angular.module('app').controller('freezeSupplierModalCtrl',['$scope','$modalInstance','httpLoad','freezeData',
        function($scope,$modalInstance,httpLoad,freezeData){ //依赖于modalInstance
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/cloudVendor/lock',
                    method:'POST',
                    data: freezeData,
                    success:function(data){
                        if(data.success){
                            //console.log(freezeData);
                            $scope.pop('平台冻结成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    //解冻ctrl
    angular.module('app').controller('thawSupplierModalCtrl',['$scope','$modalInstance','httpLoad','thawData',
        function($scope,$modalInstance,httpLoad,thawData){ //依赖于modalInstance
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/cloudVendor/active',
                    method:'POST',
                    data: thawData,
                    success:function(data){
                        if(data.success){
                            //console.log(thawData);
                            $scope.pop('平台解冻成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
})();
(function(){
    app.controller('storageTabCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '资源中心 > 存储管理';//定义当前页
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.goBack = function(){
                $state.go('app.assets.storage');
            };
        }
    ]);
    app.controller('bucketListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            $rootScope.moduleTitle = '资源中心 > 存储管理';//定义当前页
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            var storageTabvendorId = JSON.parse(localStorage.getItem('storageTabvendorId'));
            $scope.aclData = [{"name":"公有","value":true},{"name":"私有","value":false}];
            //获取bucket列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [{"param":{"vendorId":storageTabvendorId},"sign":"EQ"}];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                if($scope.searchByAcl&&$scope.searchByAcl!=""){
                    searchParam.push({"param":{"acl":$scope.searchByAcl},"sign":"EQ"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/bucket/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.bucketList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            $scope.getData(1);
            //返回
            $scope.goBack = function(){
                $scope.isActive = false;
                $timeout(function() {
                    $scope.showDetail = false;
                }, 200);
            };
            //跳转详情页
            $scope.detail = function(id,$event){
                //$event.stopPropagation();
                $state.go('app.assets.bucketDetail',{bucketId:id,id:$stateParams.id});
            };
            //新增
            $scope.add = function ($event) {  //打开模态
                $event.stopPropagation();
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/assets/storage/bucket/add.html',  //指向上面创建的视图
                    controller: 'addBucketModalCtrl',// 初始化模态范围
                    size: 'lg' //大小配置
                });
                modalInstance.result.then(function (result) {
                    $scope.getData();
                });
            };
            //删除
            $scope.remove = function($event,id){
                if($event) $event.stopPropagation();
                $scope.removeData= {"id" : id};
                var actionTxt = '是否删除bucket?';
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/storage/remove.html',
                    controller : 'removeBucketModalCtrl',
                    resolve : {
                        actionTxt : function(){
                            return actionTxt;
                        },
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
            $scope.sync = function($event){
                var action = 1;
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/storage/sync.html',
                    controller : 'msyncstorageModalCtrl',
                    resolve : {
                        action : function(){
                            return action;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addBucketModalCtrl',['$rootScope','$scope','$modalInstance','httpLoad','$stateParams',
        function($rootScope,$scope,$modalInstance,httpLoad,$stateParams){ //依赖于modalInstance
            $scope.addData = {};
            $scope.aclData = [{"name":"公有","value":true},{"name":"私有","value":false}];
            $scope.addData.acl = true;
            var storageTabvendorId = JSON.parse(localStorage.getItem('storageTabvendorId'));
            //获取可用区域数据
            $scope.getRegion = function(){
                httpLoad.loadData({
                    url:'/region/list',
                    method: 'POST',
                    data: {"id":storageTabvendorId},
                    success:function(data){
                        if(data.success){
                            $scope.regionData = data.data;
                            angular.forEach($scope.regionData, function(data,index){
                                //默认选中第一个区域
                                if(index==0){
                                    data.isRegionActive = true;
                                    $scope.addData.region = data.id;
                                }
                                else data.isRegionActive = false;
                            });
                        }
                    }
                });
            };
            $scope.getRegion();

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
                $scope.addData.id = storageTabvendorId;
                if(!$scope.addData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                if(!$scope.addData.acl){
                    $scope.pop('请选择权限','error');
                    return;
                }
                httpLoad.loadData({
                    url:'/bucket/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('Bucket新增成功');
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
    angular.module('app').controller('removeBucketModalCtrl',['$scope','$modalInstance','httpLoad','removeData','actionTxt',
        function($scope,$modalInstance,httpLoad,removeData,actionTxt){
            $scope.actionTxt = actionTxt;
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/bucket/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop(actionTxt);
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
    angular.module('app').controller('msyncstorageModalCtrl',['$rootScope','$scope','$modalInstance','httpLoad','action','$stateParams',
        function($rootScope,$scope,$modalInstance,httpLoad,action,$stateParams){
            $scope.syncData = {};$scope.modelTitle = 'Bucket同步';
            $scope.param = {
                rows: 6
            };
            var url,operationTxt,
            storageTabvendorId = JSON.parse(localStorage.getItem('storageTabvendorId'));
            switch(action){
                case 1:
                    url =  '/bucket/sync';operationTxt =  'Bucket同步成功';$scope.modelTitle = 'Bucket同步';
                    break;
            }

            //获取可用区域数据
            $scope.getRegion = function(){
                httpLoad.loadData({
                    url:'/region/list',
                    method: 'POST',
                    data: {"id":storageTabvendorId},
                    success:function(data){
                        if(data.success){
                            $scope.regionData = data.data;
                            angular.forEach($scope.regionData, function(data,index){
                                //默认选中第一个区域
                                if(index==0){
                                    data.isRegionActive = true;
                                    $scope.addData.region = data.id;
                                }
                                else data.isRegionActive = false;
                            });
                        }
                    }
                });
            };
            $scope.getRegion();
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
                $scope.syncData.id = storageTabvendorId;
                if(!$scope.syncData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                httpLoad.loadData({
                    url:url,
                    method:'POST',
                    data: $scope.syncData,
                    success:function(data){
                        if(data.success){
                            $scope.pop(operationTxt);
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
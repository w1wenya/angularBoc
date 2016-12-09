(function(){
    "use strict";
    app.controller('tenantQuotaCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '资源中心 > 配额管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            //跳转详情页
            $scope.detail = function(id){
                $state.go('app.assets.tenantQuotaDetail',{id:id});
            };
            //获取配额管理列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [];
                if($scope.searchByUsername&&$scope.searchByUsername!=""){
                    searchParam.push({"param":{"tenantName":$scope.searchBytenantName},"sign":"LK"});
                }
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"moduleName":$scope.searchBymoduleName},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/tenant/quota/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.tenantQuotaList = data.data.rows;
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
                $scope.treeData = $scope.treeData||"";
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/tenantQuota/add.html',
                    controller : 'addtenantQuotaModalCtrl',
                    size : size
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //编辑
            $scope.update = function($event,$index,row,key,size){
                $event.stopPropagation();
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/tenantQuota/update.html',
                    controller : 'updatetenantQuotaModalCtrl',
                    size : size,
                    resolve : {
                        id : function(){
                            return row.id;
                        },
                        updateData : function(){
                            return $scope.tenantQuotaList[$index];
                        }
                    }
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
                    templateUrl : '/statics/tpl/assets/tenantQuota/remove.html',
                    controller : 'removetenantQuotaModalCtrl',
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

        }
    ]);

    //新增ctrl
    angular.module('app').controller('addtenantQuotaModalCtrl',['$scope','$modalInstance','httpLoad',
        function($scope,$modalInstance,httpLoad){ //依赖于modalInstance
            $scope.addData={};

            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/tenant/quota/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success&&data.data){
                            $scope.pop('配额新增成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    //编辑ctrl
    angular.module('app').controller('updatetenantQuotaModalCtrl',['$scope','$modalInstance','httpLoad','updateData',
        function($scope,$modalInstance,httpLoad,updateData){ //依赖于modalInstance
            var aa=JSON.stringify(updateData);
            $scope.updateData=JSON.parse(aa);

            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/tenant/quota/modify',
                    method:'POST',
                    data: $scope.updateData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('配额编辑成功');
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
    angular.module('app').controller('removetenantQuotaModalCtrl',['$scope','$modalInstance','httpLoad','removeData',
        function($scope,$modalInstance,httpLoad,removeData){ //依赖于modalInstance
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/tenant/quota/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('配额删除成功');
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
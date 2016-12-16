(function(){
    app.controller('middlewareTabCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '资源管理 > 中间件管理';//定义当前页
            $rootScope.link = '/statics/css/user.css';
        }
    ]);
    app.controller('middleCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 安全组管理';
            //$rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };

            //获取列表
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
                if($scope.searchByType&&$scope.searchByType!=""){
                    searchParam.push({"param":{"category":$scope.searchByName},"sign":"EQ"});
                }
                if($scope.searchByOwner&&$scope.searchByOwner!=""){
                    if(searchParam.length==0) searchParam.push({"param":{"serviceVendor":$scope.searchByOwner},"sign":"LK"});
                    else {
                        var a = 0;
                        for(var i=0;i<searchParam.length;i++){
                            if(searchParam[i].sign=="LK") {
                                a = 1;
                                searchParam[i].param.serviceVendor = $scope.searchByOwner;
                            }
                        }
                        if(a==0) searchParam.push({"param":{"serviceVendor":$scope.searchByOwner},"sign":"LK"});
                    }
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/middleware/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.middlewareList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            $scope.getData(1);
            //状态数据
            $scope.typeData = [{"value":"WEBLOGIC","name":"weblogic"},{"value":"DB2","name":"db2"},{"value":"SYBASE","name":"sybase"},{"value":"SQLSERVER","name":"sqlserver"},{"value":"MONGODB","name":"mongodb"},{"value":"ZOOKEEPER","name":"zookeeper"},{"value":"MQ","name":"mq"}];
            //重置
            $scope.reset = function(){
                $scope.searchByName = "";
                $scope.searchByType = "";
                $scope.searchByOwner = "";
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
                $state.go('app.assets.middlewareDetail',{id:id});
            };
            //新增
            $scope.add = function($event){
                $event.stopPropagation();
                $state.go('app.assets.middlewareAdd');
            };
            //编辑
            $scope.update = function($event,$index,row,key,size){
                $event.stopPropagation();
                $state.go('app.assets.middlewareUpdate',{id:row.id});
            };
            //删除
            $scope.remove = function($event,id){
                if($event) $event.stopPropagation();
                $scope.removeData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/middleware/remove.html',
                    controller : 'removemiddlewareModalCtrl',
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
    //删除ctrl
    angular.module('app').controller('removemiddlewareModalCtrl',['$scope','$modalInstance','httpLoad','removeData',
        function($scope,$modalInstance,httpLoad,removeData){ //依赖于modalInstance
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/middleware/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('中间件删除成功');
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
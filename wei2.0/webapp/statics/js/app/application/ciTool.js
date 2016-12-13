(function(){
    "use strict";
    app.controller('IntegrateCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '应用中心 > 持续集成';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
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
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/ci/tool/list',
                    method:'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data){
                            $scope.ciToolList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                            angular.forEach($scope.ciToolList, function(data,index){
                                //密码处理
                                var password = '';
                                for(var i=0;i<data.password.length;i++){
                                    password +='*';
                                }
                                data.password1 = password;
                            });
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
            $scope.detail = function(id){
                $state.go('app.application.integrateDetail',{id:id});
            };
            //新增
            $scope.add = function($event,size){
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/application/ciTool/add.html',
                    controller : 'addIntegrateModalCtrl',
                    size : size
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //编辑
            $scope.update = function($event,row,size){
                $event.stopPropagation();
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/application/ciTool/update.html',
                    controller : 'updateIntegrateModalCtrl',
                    size : size,
                    resolve : {
                        id : function(){
                            return row.id;
                        },
                        updateData : function(){
                            return row;
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
                    templateUrl : '/statics/tpl/application/ciTool/remove.html',
                    controller : 'removeIntegrateModalCtrl',
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
                httpLoad.loadData({
                    url:'/ci/tool/sync',
                    method:'POST',
                    data: {id: row.id},
                    success:function(data){
                        if(data.success){
                            $scope.pop('集成工具同步成功');
                            $scope.getData();
                        }
                    }
                });
            };
            //任务列表
            $scope.user = function($event,id){
                $event.stopPropagation();
                $state.go('app.application.integrateJob',{id:id});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addIntegrateModalCtrl',['$scope','$modalInstance','httpLoad',
        function($scope,$modalInstance,httpLoad){
            $scope.addData={};

            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/ci/tool/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('集成工具添加成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            };
        }]);
    //编辑ctrl
    angular.module('app').controller('updateIntegrateModalCtrl',['$scope','$modalInstance','httpLoad','updateData',
        function($scope,$modalInstance,httpLoad,updateData){
            var list = ["name","username","password","address","remark","id"];
            $scope.updateData={};
            for(var i=0;i<list.length;i++){
                var item = list[i];
                $scope.updateData[item] = updateData[item];
            }

            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/ci/tool/modify',
                    method:'POST',
                    data: $scope.updateData,
                    success:function(data){
                        if(data.success){
                            //console.log($scope.updateData);
                            $scope.pop('集成工具编辑成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            };
        }]);
    //删除ctrl
    angular.module('app').controller('removeIntegrateModalCtrl',['$scope','$modalInstance','httpLoad','removeData',
        function($scope,$modalInstance,httpLoad,removeData){
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/ci/tool/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            //console.log(removeData);
                            $scope.pop('集成工具删除成功');
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
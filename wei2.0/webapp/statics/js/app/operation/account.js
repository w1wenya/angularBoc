(function(){
    "use strict";
    app.controller('accountCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','LANGUAGE',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,LANGUAGE) {
            $rootScope.moduleTitle = '运维中心 > 认证管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            $scope.isbatchDelete = true;
            //获取认证列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"username":$scope.searchByName},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/ident/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            //console.log(params);
                            $scope.accountList = data.data.rows;
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
                    templateUrl : '/statics/tpl/operation/account/add.html',
                    controller : 'addAccountModalCtrl',
                    size : size,
                    resolve : {
                        accountList : function(){
                            return $scope.accountList;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //编辑
            $scope.update = function($event,$index,row,key,size){
                $event.stopPropagation();
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/operation/account/update.html',
                    controller : 'updateAccountModalCtrl',
                    size : size,
                    resolve : {
                        id : function(){
                            return row.id;
                        },
                        updateData : function(){
                        	row.isSudo=''+row.isSudo;
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
                    templateUrl : '/statics/tpl/operation/account/remove.html',
                    controller : 'removeAccountModalCtrl',
                    resolve : {
                        index : function(){
                            return $index;
                        },
                        removeData : function(){
                            return $scope.removeData;
                        },
                        accountList : function(){
                            return $scope.accountList;
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
                $state.go('app.config.accountDetail',{id:id});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addAccountModalCtrl',['$scope','$modalInstance','httpLoad','accountList',
        function($scope,$modalInstance,httpLoad,accountList){
            $scope.addData={};

            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/ident/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('认证添加成功');
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
    angular.module('app').controller('updateAccountModalCtrl',['$scope','$modalInstance','httpLoad','updateData',
        function($scope,$modalInstance,httpLoad,updateData){
            var aa=JSON.stringify(updateData);
            $scope.updateData=JSON.parse(aa);

            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/ident/modify',
                    method:'POST',
                    data: $scope.updateData,
                    success:function(data){
                        if(data.success){
                            //console.log($scope.updateData);
                            $scope.pop('认证编辑成功');
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
    angular.module('app').controller('removeAccountModalCtrl',['$scope','$modalInstance','httpLoad','removeData','accountList','index',
        function($scope,$modalInstance,httpLoad,removeData,accountList,index){
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/ident/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            //console.log(removeData);
                            $scope.pop('认证删除成功');
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
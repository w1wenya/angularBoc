(function(){
    "use strict";
    app.controller('commandCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '参数管理 > 关键字管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            //获取认证列表
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
                    url:'/command/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.commandList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            $scope.getData(1);
            //级别数据
            $scope.levelData = [{"value":"DEADLY","name":"致命"},{"value":"HIGH","name":"严重"},{"value":"SERIOUS","name":"高危"},{"value":"MEDIUM","name":"中等"},{"value":"COMMON","name":"普通"}];
            //新增
            $scope.add = function($event,size){
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/command/add.html',
                    controller : 'addCommandModalCtrl',
                    size : size,
                    resolve : {
                        commandList : function(){
                            return $scope.commandList;
                        },
                        levelData : function(){
                            return $scope.levelData;
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
                    templateUrl : '/statics/tpl/config/command/update.html',
                    controller : 'updateCommandModalCtrl',
                    size : size,
                    resolve : {
                        id : function(){
                            return row.id;
                        },
                        updateData : function(){
                            return row;
                        },
                        levelData: function(){
                            return $scope.levelData;
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
                    templateUrl : '/statics/tpl/config/command/remove.html',
                    controller : 'removeCommandModalCtrl',
                    resolve : {
                        index : function(){
                            return $index;
                        },
                        removeData : function(){
                            return $scope.removeData;
                        },
                        commandList : function(){
                            return $scope.commandList;
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
                $state.go('app.config.commandDetail',{id:id});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addCommandModalCtrl',['$scope','$modalInstance','httpLoad','commandList','levelData',
        function($scope,$modalInstance,httpLoad,commandList,levelData){
            $scope.levelData = levelData;
            $scope.addData={};$scope.addData.level = 'DEADLY';

            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/command/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('命令审计添加成功');
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
    angular.module('app').controller('updateCommandModalCtrl',['$scope','$modalInstance','httpLoad','updateData','levelData',
        function($scope,$modalInstance,httpLoad,updateData,levelData){
            $scope.levelData = levelData;
            var aa=JSON.stringify(updateData);
            $scope.updateData=JSON.parse(aa);

            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/command/modify',
                    method:'POST',
                    data: $scope.updateData,
                    success:function(data){
                        if(data.success){
                            //console.log($scope.updateData);
                            $scope.pop('命令审计编辑成功');
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
    angular.module('app').controller('removeCommandModalCtrl',['$scope','$modalInstance','httpLoad','removeData','commandList','index',
        function($scope,$modalInstance,httpLoad,removeData,commandList,index){
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/command/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            //console.log(removeData);
                            $scope.pop('命令审计删除成功');
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
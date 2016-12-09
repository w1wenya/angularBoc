(function(){
    "use strict";
    app.controller('tenantResourceCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state', '$stateParams','LANGUAGE',
        function($scope, httpLoad, $rootScope, $modal, $state, $stateParams, LANGUAGE) {
            $rootScope.moduleTitle = '系统管理 > 租户管理';//定义当前页
            $scope.itemsByPage = 20;//定义每页的条数
            //加载服务器列表
            var loadData = function(){
                httpLoad.loadData({
                    url:'/tenant/res',
                    method:'POST',
                    data:{
                        id:$stateParams.id
                    },
                    success:function(data){
                        if(data.success){
                            $scope.serverListData= data.data.rows;
                            $scope.total = data.data.length;
                        }
                    }
                });
            };
            loadData();
            //选择服务器
            $scope.selectServer = function(){
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/userCenter/tenant/bindModal.html',
                    controller: 'bindtenantModalCtrl',
                    backdrop: 'static',
                    size:'lg'
                });
                modalInstance.result.then(function (data) {
                    loadData();
                });
            };
            $scope.goBack = function(){
                $state.go('app.userCenter.tenant');
            };
            //删除
            $scope.remove = function (id,$event){
                if($event) $event.stopPropagation();
                var removeData = {"id":$stateParams.id,"resId":id};
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/userCenter/department/remove.html',
                    controller: 'removetenantModalCtrl',
                    backdrop: 'static',
                    resolve: {
                        removeData: function() {
                            return  removeData;
                        }
                    }
                });
                modalInstance.result.then(function() {
                    loadData();
                });
            };
        }
    ]);
    //删除
    angular.module('app').controller('removetenantModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'removeData',
        function($scope, $modalInstance, httpLoad, removeData) {
            $scope.content= '是否删除分配资源？';
            $scope.ok = function(){
                httpLoad.loadData({
                    url: '/tenant/deleteRes',
                    data: removeData,
                    success: function(data){
                        if(data.success){
                            $scope.pop("分配资源删除成功");
                            $modalInstance.close();
                        }
                    }
                });
            }
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
    //新增绑定
    app.controller('bindtenantModalCtrl', ['$scope','httpLoad','$modalInstance','$stateParams',
        function($scope, httpLoad, $modalInstance, $stateParams) {
            $scope.param = {
                page: 1,
                rows: 8,
                target: $stateParams.id,
                category: "TENANT"
            };
            var selectList = [];
            $scope.getList = function(page){
                $scope.param.page = page || $scope.param.page;
                $scope.isSelectAll = false;
                //获取已选主机的IPlist
                var ipList = [];
                for(var a in selectList){
                    ipList.push(selectList[a].ip);
                }

                var searchParam = [];
                if($scope.ip&&$scope.ip!=""){
                    searchParam.push({"param":{"ip":$scope.ip},"sign":"LK"});
                }
                if($scope.name&&$scope.name!=""){
                    searchParam.push({"param":{"name":$scope.name},"sign":"LK"});
                }
                $scope.param.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/res/list',
                    method:'POST',
                    data:$scope.param,
                    noParam: true,
                    success:function(data){
                        if(data.success){
                            $scope.listData = data.data.rows;
                            //数据反显
                            for(var i = 0; i < $scope.listData.length; i++){
                                var item = $scope.listData[i];
                                var flag = ipList.indexOf(item.ip);
                                if(flag > -1) $scope.listData[i] = selectList[flag];
                            }
                            $scope.totalPage = data.data.total;
                        }
                    }
                });
            };
            $scope.getList();
            //对选择的数据进行操作
            var setSelectList = function(data){
                if(data.isSelected){
                    selectList.push(data);
                }else{
                    for(var j = 0; j < selectList.length; j++){
                        var item = selectList[j];
                        if(item.ip == data.ip) selectList.splice(j,1)
                    }
                }
            };
            //全选
            $scope.selectAll = function(){
                for(var a in $scope.listData){
                    var item = $scope.listData[a];
                    if($scope.isSelectAll != item.isSelected){
                        item.isSelected = $scope.isSelectAll;
                        setSelectList(item);
                    }else item.isSelected = $scope.isSelectAll;
                }
            };
            //选择一个
            $scope.selectItem = function ($event,row) {
                $event.stopPropagation();
                setSelectList(row);
            };
            $scope.ok = function () {
                var resources = [];
                selectList.forEach(function (item) {
                    resources.push({resId:item.id,shared:(item.shared||false)})
                });
                httpLoad.loadData({
                    url:'/tenant/assign',
                    data:{
                        id:$stateParams.id,
                        resources:resources
                    },
                    success: function(data){
                        if(data.success){
                            $scope.pop("资源分配添加成功");
                            $modalInstance.close(data);
                        }
                    }
                });
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
})()
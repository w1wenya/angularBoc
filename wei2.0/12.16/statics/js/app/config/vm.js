(function(){
    "use strict";
    app.controller('vmCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '资源管理 > 平台管理';//定义当前页
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 8
            };
            $scope.isEight = false;
            //获取云主机列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                    page: $scope.param.page,
                    rows: $scope.param.rows
                },
                //searchParam = [{"param":{"category":"COMPUTER"},"sign":"LK"}];
                searchParam = [];
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/cloudVendor/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success){
                            if(data.data){
                                $scope.countData = data.data.rows;
                                $scope.totalCount = data.data.total;
                                if($scope.totalCount>8) $scope.isEight = true;
                            }
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
            //跳转Tab页
            $scope.goVm = function(row){
                //$rootScope.vmSupplierId = id;
                $state.go('app.assets.vmTab',{id:row.id});
                sessionStorage.setItem('vmTabvendor', JSON.stringify({id:row.id,type:row.type}));
                sessionStorage.setItem('vmtabLocation', JSON.stringify('vm'));
            };
        }
    ]);
})();
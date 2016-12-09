(function(){
    "use strict";
    app.controller('DataBaseCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '资源中心 > 数据库管理';//定义当前页
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 8
            };
            $scope.isEight = false;
            //获取列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                    page: $scope.param.page,
                    rows: $scope.param.rows
                },
                searchParam = [{"param":{"category":"CPS"},"sign":"EQ"}];
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
            //跳转Tab页
            $scope.goVm = function(row){
                var flag;
                switch(row.type){
                    case 'ALIYUN':
                        flag = 1;
                    break;
                    case 'JDYUN':
                        flag = 2;
                    break;
                }
                $state.go('app.assets.dblist',{flag:flag,id:row.id});
            };
        }
    ]);
})();
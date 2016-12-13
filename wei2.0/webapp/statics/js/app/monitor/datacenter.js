(function() {
    "use strict";
    app.controller('datacenterCtrl', ['$scope','$rootScope','$modal', 'httpLoad','$timeout','$state',function($scope,$rootScope,$modal, httpLoad,$timeout,$state) {
        $rootScope.moduleTitle = '监控中心 > 数据中心';
        $rootScope.link = '/statics/css/tpl-card.css';
        $scope.param = {
            page:1,
            rows: 10
        };
        $scope.isCheck = true;

        $scope.loadDataCenterList = function(page){
            $scope.param.page = page || $scope.param.page;
            httpLoad.loadData({
                url: '/dc/list',
                data:$scope.param,
                noParam:true,
                success: function(data){
                    if(data.success){
                        $scope.dataCenterList = data.data.rows;
                        $scope.totalCount = data.data.total;
                    }
                }
            });
        };
        $scope.loadDataCenterList(1);
        //搜索
        $scope.search = function(){
            //对参数进行处理，去除空参数
            var toObjFormat = function(obj) {
                for (var a in obj) {
                    if (obj[a] == "") delete obj[a];
                }
                return obj;
            }
            var params = [];
            var param1 = toObjFormat({
                name: $scope.name
            });
            if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
            $scope.param = {
                page: 1,
                rows: 10,
                params: angular.toJson(params)
            }
            $scope.loadDataCenterList();
        }
        //重置搜索条件
        $scope.reset = function(){
            var obj = ['name'];
            angular.forEach(obj,function(data){
                $scope[data] = '';
            })
        };

        $scope.goMonitor = function(id){
            $state.go('app.monitor.datacenterMonitor',{id:id})
        };
    }]);
})();




//(function(){
//    "use strict";
//    app.controller('datacentermonitorCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
//        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
//            $rootScope.moduleTitle = '监控中心 > 数据中心';
//            $rootScope.link = '/statics/css/monitor.css';
//            $scope.param = {
//                rows: 10
//            };
//            //获取监控指标列表
//            $scope.getData = function(page){
//                $scope.param.page = page || $scope.param.page;
//                var params = {
//                    page: $scope.param.page,
//                    rows: $scope.param.rows
//                },
//                searchParam = [];
//                if($scope.searchByName&&$scope.searchByName!=""){
//                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
//                }
//                params.params = JSON.stringify(searchParam);
//                httpLoad.loadData({
//                    url:'/dc/list',
//                    method: 'POST',
//                    data: params,
//                    noParam: true,
//                    success:function(data){
//                        if(data.success&&data.data){
//                            //console.log(params);
//                            $scope.datacenterList = data.data.rows;
//                            $scope.totalCount = data.data.total;
//                            $scope.isImageData = false;
//                        }else{
//                            $scope.isImageData = true;
//                        }
//                    }
//                });
//            };
//            $scope.getData(1);
//
//            //返回
//            $scope.goBack = function(){
//                $scope.isActive = false;
//                $timeout(function() {
//                    $scope.showDetail = false;
//                }, 200);
//            };
//            //跳转详情页
//            $scope.detail = function(id,$event){
//                $state.go('app.monitor.datacenterMonitor',{id:id});
//            };
//        }
//    ]);
//})();
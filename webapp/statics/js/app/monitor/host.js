angular.module('app').controller('serverCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', '$state','LANGUAGE',function($rootScope, $scope, httpLoad, $modal, $state, LANGUAGE) {
    $rootScope.link = '/statics/css/tpl-card.css';
    $rootScope.moduleTitle = '监控中心 > 主机监控';
    $scope.isCheck = true;

    $scope.param = {
        rows: 10
    };
    //获取服务器列表数据
    $scope.getServerList = function(page){
        $scope.param.page = page || $scope.param.page;
        httpLoad.loadData({
            url: '/server/list',
            data: $scope.param,
            noParam: true,
            success: function(data){
                if(data.success){
                    $scope.serverListData = data.data.rows;
                    $scope.totalCount = data.data.total;
                }
            }
        });
    };
    $scope.getServerList(1);
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
        $scope.getServerList();
    }
    //重置搜索条件
    $scope.reset = function(){
        var obj = ['name'];
        angular.forEach(obj,function(data){
            $scope[data] = '';
        })
    };
    (function(){
        //获取数据中心列表数据
        httpLoad.loadData({
            url: '/dc/list',
            noParam: true,
            success: function(data){
                if(data.success){
                    $scope.dataCenterData = data.data.rows;
                }
            }
        });
    })()

    $scope.goMonitor = function(id){
        $state.go('app.monitor.serverMonitor',{id:id})
    };
}]);

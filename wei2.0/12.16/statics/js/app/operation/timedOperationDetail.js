angular.module('app').controller('detailTimedOperationModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '日常作业 > 定时作业详情';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/cron/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.timedOperationDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                }
            }
        });
        $scope.getHistoryList = function(page){
            $scope.param.page = page || $scope.param.page;
            var params = {
                    page: $scope.param.page,
                    rows: $scope.param.rows
                },
            searchParam = [{"param":{"ctId":id},"sign":"EQ"}];
            params.params = JSON.stringify(searchParam);
            httpLoad.loadData({
                url:'/record/list',
                method:'POST',
                noParam:true,
                data:params,
                success:function(data){
                    if(data.success){
                        $scope.historyListData = data.data.rows;
                        $scope.totalPage = data.data.total;
                    }
                }
            });
        }
        $scope.getHistoryList(1);
    })();
    $scope.goBack = function(){
        $state.go('app.operation.timedOperation');
    };
}]);
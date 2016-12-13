angular.module('app').controller('integrateJobCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';//引入页面样式
    $rootScope.moduleTitle = '应用中心 > 持续集成';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.id;
        //获取租户下的用户列表
        $scope.getData = function(page){
            $scope.param.page = page || $scope.param.page;
            var params = {
                page: $scope.param.page,
                rows: $scope.param.rows
            };
            var opt=[{param:{toolId:id},"sign":"EQ"}];
            params.params = JSON.stringify(opt);
            httpLoad.loadData({
                url:'/ci/job/list',
                method:'POST',
                noParam: true,
                data: params,
                success:function(data){
                    if(data.success&&data.data){
                        $scope.ciJobList = data.data.rows;
                        $scope.showDetail = $scope.isActive = true;
                        $scope.totalCount = data.data.total;
                        $scope.isImageData = false;
                    }else{
                        $scope.isImageData = true;
                    }
                }
            });
        };
        $scope.getData(1);
        //部署
        $scope.goDeploy = function (row) {
            httpLoad.loadData({
                url:'/ci/job/build',
                method:'POST',
                data: {id:row.id},
                success:function(data){
                    if(data.success){
                        $scope.pop("构建任务成功");
                    }
                }
            });
            //if(flag) $state.go('app.operation.newtask',{id:item.id+'$'+item.taskId,flag:7});
            //else{
            //    if(item.taskId) $state.go('app.operation.newtask',{id:item.id+'$'+item.taskId,flag:9});
            //    else $state.go('app.operation.newtask',{id:item.id,flag:8});
            //}
        };
    })();
    $scope.goBack = function(){
        $state.go('app.application.integrate');
    };
}]);
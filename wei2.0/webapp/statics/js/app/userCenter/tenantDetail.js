angular.module('app').controller('tenantDetailCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams','LANGUAGE',function($rootScope, $scope,$state,httpLoad,$stateParams,LANGUAGE) {
    $rootScope.link = '/statics/css/user.css';//引入页面样式
    $rootScope.moduleTitle = '系统管理 > 租户管理';
    $scope.param = {
        rows: 10
    };
    $scope.title = LANGUAGE.OPERATION.USER.DETAILREMARK;
    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/tenant/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.tenantDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.userCenter.tenant');
    };
}]);
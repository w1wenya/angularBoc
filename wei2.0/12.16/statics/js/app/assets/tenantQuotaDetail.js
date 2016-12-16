angular.module('app').controller('tenantQuotaDetailModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源中心 > 配额管理';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/tenant/quota/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.volumeDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.assets.vmTab');
    };
}]);
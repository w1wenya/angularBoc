angular.module('app').controller('detailAccountModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '运维中心 > 认证管理';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/ident/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.accountDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.config.account');
    };
}]);
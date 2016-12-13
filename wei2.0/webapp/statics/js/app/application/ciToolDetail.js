angular.module('app').controller('detailIntegrateModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '应用中心 > 持续集成';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/ci/tool/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.ciToolDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                    //密码处理
                    var password = '';
                    for(var i=0;i<$scope.ciToolDetail.password.length;i++){
                        password +='*';
                    }
                    $scope.ciToolDetail.password = password;
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.application.integrate');
    };
}]);
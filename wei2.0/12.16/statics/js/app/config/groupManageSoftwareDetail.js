angular.module('app').controller('detailGroupManageSoftwareModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '参数管理 > 软件仓库';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/software/group/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.groupSoftwareDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                }
            }
        });
    })();
    $scope.goBack = function(){
        sessionStorage.setItem('softwaretabLocation', JSON.stringify('groupSoftwareDetail'));
        $state.go('app.config.manageSoftware');
    };
}]);
angular.module('app').controller('snapshotDetailModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源中心 > 快照管理';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.vmId;
        httpLoad.loadData({
            url:'/snapshot/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.snapshotDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.assets.vmTab',{id:$stateParams.id});
        localStorage.setItem('vmtabLocation', JSON.stringify('snapshotDetail'));
    };
}]);
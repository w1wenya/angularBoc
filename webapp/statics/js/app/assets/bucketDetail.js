angular.module('app').controller('bucketDetailModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源中心 > 存储管理';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.bucketId;
        httpLoad.loadData({
            url:'/bucket/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success){
                    $scope.bucketDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.assets.storageTab',{id:$stateParams.id});
    };
}]);
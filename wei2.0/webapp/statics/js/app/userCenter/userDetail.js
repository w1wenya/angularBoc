angular.module('app').controller('userDetailCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams','LANGUAGE',function($rootScope, $scope,$state,httpLoad,$stateParams,LANGUAGE) {
    $rootScope.link = '/statics/css/user.css';//引入页面样式
    $rootScope.moduleTitle = '系统管理 > 用户管理';
    $scope.param = {
        rows: 10
    };
    $scope.title = LANGUAGE.OPERATION.USER.DETAILREMARK;
    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/user/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.userDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.userCenter.user');
    };
}]);
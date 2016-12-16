angular.module('app').controller('detailmiddlewareModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源管理 > 中间件管理';

    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/middleware/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.middlewareDetail = data.data;
                    $scope.showDetail = 3;
                    $scope.isActive = true;

                    //密码处理
                    var password = '';
                    for(var i=0;i<$scope.middlewareDetail.password.length;i++){
                        password +='*';
                    }
                    $scope.middlewareDetail.password = password;
                }
            }
        });
    })();

    $scope.goBack = function(){
        $state.go('app.assets.middleware');
    };
}]);
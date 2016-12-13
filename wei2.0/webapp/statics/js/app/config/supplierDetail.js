angular.module('app').controller('detailSupplierModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '配置中心 > 平台管理';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/cloudVendor/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.supplierDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                    //密码处理
                    var password = '';
                    for(var i=0;i<$scope.supplierDetail.password.length;i++){
                        password +='*';
                    }
                    $scope.supplierDetail.password = password;
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.config.cloudVendor');
    };
}]);
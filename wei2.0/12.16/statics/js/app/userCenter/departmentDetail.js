angular.module('app').controller('detailDepartmentModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '系统管理 > 组织机构';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/department/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.departmentDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.userCenter.department');
    };
}]);
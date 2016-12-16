angular.module('app').controller('subnetDetailModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源中心 > 平台管理';
    $scope.param = {
        rows: 10
    };
    //openstack显示1
    var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
    if(vmTabvendor.type == 'OPENSTACK'){
        $scope.openstackNetworkTable = 1;
    }
    (function(){
        var id = $stateParams.vmId;
        httpLoad.loadData({
            url:'/subnet/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.subnetDetail = data.data;
                    $scope.showDetail = 3;
                    $scope.isActive = true;
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.assets.vmTab',{id:$stateParams.id});
        sessionStorage.setItem('vmtabLocation', JSON.stringify('subnetDetail'));
    };
}]);
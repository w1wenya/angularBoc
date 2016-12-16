angular.module('app').controller('detailImageModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源管理 > 平台管理';
    $scope.param = {
        rows: 10
    };
    var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
    if(vmTabvendor.type=='JDYUN'||vmTabvendor.type == 'ALIYUN'){
        $scope.showJDYUN = true;
    }else if(vmTabvendor.type=='OPENSTACK'){
        $scope.showOPENSTACK = true;
    }
    (function(){
        var id = $stateParams.vmId;
        httpLoad.loadData({
            url:'/image/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.imageDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                    if($scope.showOPENSTACK == true) {
                        $scope.imageDetail.status = '运行中';
                    }
                }
            }
        });
    })();
    $scope.goBack = function(){
        $state.go('app.assets.vmTab',{id:$stateParams.id});
        sessionStorage.setItem('vmtabLocation', JSON.stringify('imageDetail'));
    };
}]);
angular.module('app').controller('DataBaseDetailCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源中心 > 数据库详情';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.id;
        httpLoad.loadData({
            url:'/db/ins/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.detailData = data.data;
                    //状态处理
                    // switch($scope.vmDetail.status){
                    //     case 'RUNNING':
                    //         $scope.vmDetail.statusColor = "success";
                    //         break;
                    //     case 'STOPPED':
                    //         $scope.vmDetail.statusColor = "warning";
                    //         break;
                    //     case 'STOPPING':
                    //         $scope.vmDetail.statusColor = "default";
                    //         break;
                    //     case 'STARTING':
                    //         $scope.vmDetail.statusColor = "default";
                    //         break;
                    //     case 'SUSPENDED':
                    //         $scope.vmDetail.statusColor = "primary";
                    //         break;
                    //     case 'SUSPENDING':
                    //         $scope.vmDetail.statusColor = "default";
                    //         break;
                    //     case 'ACTIVING':
                    //         $scope.vmDetail.statusColor = "default";
                    //         break;
                    //     case 'PAUSED':
                    //         $scope.vmDetail.statusColor = "warning";
                    //         break;
                    //     case 'PAUSING':
                    //         $scope.vmDetail.statusColor = "default";
                    //         break;
                    //     case 'RECOVERING':
                    //         $scope.vmDetail.statusColor = "default";
                    //         break;
                    //     case 'PAUSING':
                    //         $scope.vmDetail.statusColor = "default";
                    //         break;
                    //     case 'BUILDING':
                    //         $scope.vmDetail.statusColor = "default";
                    //         break;
                    //     case 'RESTARTING':
                    //         $scope.vmDetail.statusColor = "default";
                    //         break;
                    //     case 'EXCEPTION':
                    //         $scope.vmDetail.statusColor = "danger";
                    //         break;
                    // }
                }
            }
        });
    })();
    $scope.goBack = function(){
        history.go(-1);
    };
}]);
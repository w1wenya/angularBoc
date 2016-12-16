angular.module('app').controller('detailVmTemplateModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源管理 > 平台管理';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.vmId;
        httpLoad.loadData({
            url:'/vm/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.vmDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                    //状态处理
                    switch($scope.vmDetail.status){
                        case 'RUNNING':
                            $scope.vmDetail.statusColor = "success";
                            break;
                        case 'STOPPED':
                            $scope.vmDetail.statusColor = "warning";
                            break;
                        case 'STOPPING':
                            $scope.vmDetail.statusColor = "default";
                            break;
                        case 'STARTING':
                            $scope.vmDetail.statusColor = "default";
                            break;
                        case 'SUSPENDED':
                            $scope.vmDetail.statusColor = "primary";
                            break;
                        case 'SUSPENDING':
                            $scope.vmDetail.statusColor = "default";
                            break;
                        case 'ACTIVING':
                            $scope.vmDetail.statusColor = "default";
                            break;
                        case 'PAUSED':
                            $scope.vmDetail.statusColor = "warning";
                            break;
                        case 'PAUSING':
                            $scope.vmDetail.statusColor = "default";
                            break;
                        case 'RECOVERING':
                            $scope.vmDetail.statusColor = "default";
                            break;
                        case 'PAUSING':
                            $scope.vmDetail.statusColor = "default";
                            break;
                        case 'BUILDING':
                            $scope.vmDetail.statusColor = "default";
                            break;
                        case 'RESTARTING':
                            $scope.vmDetail.statusColor = "default";
                            break;
                        case 'EXCEPTION':
                            $scope.vmDetail.statusColor = "danger";
                            break;
                    }

                    //密码处理
                    var password = '';
                    for(var i=0;i<$scope.vmDetail.password.length;i++){
                        password +='*';
                    }
                    $scope.vmDetail.password = password;
                }
            }
        });
        //获取列表数据
        $scope.getOperateData = function(page){
            $scope.param.page = page || $scope.param.page;
            var params = {
                    page: $scope.param.page,
                    rows: $scope.param.rows
                },
                searchParam = [];
            searchParam.push({"param":{"resId":id},"sign":"EQ"});
            params.params = JSON.stringify(searchParam);
            httpLoad.loadData({
                url:'/res/event/list',
                method: 'POST',
                data: params,
                noParam: true,
                success:function(data){
                    if(data.success){
                        if(data.data){
                            $scope.eventList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                        }
                    }else{
                        $scope.isImageData = true;
                    }
                }
            });
        };
        $scope.getOperateData(1);
    })();
    $scope.goBack = function(){
        $state.go('app.assets.vmTab',{id:$stateParams.id});
        sessionStorage.setItem('vmtabLocation', JSON.stringify('vmTemplateDetail'));
    };
}]);
angular.module('app').controller('volumeDetailModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源管理 > 平台管理';
    $scope.param = {
        rows: 10
    };
    (function(){
        var id = $stateParams.vmId;
        var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
        httpLoad.loadData({
            url:'/volume/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.volumeDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;

                    if(vmTabvendor.type == 'OPENSTACK'){
                        if($scope.volumeDetail.status=='AVAILABLE') $scope.volumeDetail.status1 = '可用配额';
                        else if($scope.volumeDetail.status=='INUSE') $scope.volumeDetail.status1 = '正在使用';
                        else if($scope.volumeDetail.status=='BUILDING') $scope.volumeDetail.status1 = '创建中';
                        else $scope.volumeDetail.status1 = '异常';
                    }else if(vmTabvendor.type == 'ALIYUN'||vmTabvendor.type == 'JDYUN'){
                        if($scope.volumeDetail.status=='AVAILABLE') $scope.volumeDetail.status1 = '可用配额';
                        else if($scope.volumeDetail.status=='BUILDING') $scope.volumeDetail.status1 = '创建中';
                        else $scope.volumeDetail.status1 = '正在使用';
                    }
                    $scope.getOperateData(1,$scope.volumeDetail.volumeId);
                }
            }
        });

        //获取列表数据
        $scope.getOperateData = function(page,volumeId){
            volumeId = volumeId||$scope.volumeDetail.volumeId;
            $scope.param.page = page || $scope.param.page;
            var params = {
                    page: $scope.param.page,
                    rows: $scope.param.rows
                },
                searchParam = [];
            searchParam.push({"param":{"volumeId":volumeId},"sign":"EQ"});
            params.params = JSON.stringify(searchParam);
            httpLoad.loadData({
                url:'/snapshot/list',
                method: 'POST',
                data: params,
                noParam: true,
                success:function(data){
                    if(data.success&&data.data.rows&&data.data.rows.length!=0){
                        $scope.snapshotList = data.data.rows;
                        $scope.totalCount = data.data.total;
                        $scope.isImageData = false;
                        angular.forEach($scope.snapshotList, function(data,index){
                            if(data.status=='AVAILABLE') data.status1 = '可用配额';
                            else if(data.status=='BUILDING') data.status1 = '创建中';
                        });
                    }else{
                        $scope.isImageData = true;
                    }
                }
            });
        };
        //$scope.getOperateData(1);
    })();
    $scope.goBack = function(){
        $state.go('app.assets.vmTab',{id:$stateParams.id});
        sessionStorage.setItem('vmtabLocation', JSON.stringify('volumeDetail'));
    };
}]);
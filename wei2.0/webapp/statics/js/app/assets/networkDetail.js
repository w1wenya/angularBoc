angular.module('app').controller('networkDetailModalCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源中心 > 网络管理';
    $scope.param = {
        rows: 10
    };
    //openstack显示1,；京东云和阿里云显示2
    var vmTabvendor = JSON.parse(localStorage.getItem('vmTabvendor'));
    if(vmTabvendor.type == 'OPENSTACK'){
        $scope.openstackNetworkTable = 1;
    }else if(vmTabvendor.type == 'JDYUN'||vmTabvendor.type == 'ALIYUN'||vmTabvendor.type == 'VMWARE'){
        $scope.otherNetworkTable = 1;
    }
    (function(){
        var id = $stateParams.vmId;
        httpLoad.loadData({
            url:'/network/detail',
            method:'GET',
            data: {id: id},
            success:function(data){
                if(data.success&&data.data){
                    $scope.volumeDetail = data.data;
                    $scope.showDetail = $scope.isActive = true;
                    if($scope.volumeDetail.status=='ACTIVE') $scope.volumeDetail.status1 = '运行中';
                    if($scope.volumeDetail.shared==true) $scope.volumeDetail.shared1 = '是';
                    if($scope.volumeDetail.shared==false) $scope.volumeDetail.shared1 = '否';

                    $scope.getOperateData(1,$scope.volumeDetail.networkId);
                }
            }
        });

        //获取列表数据
        $scope.getOperateData = function(page,networkId){
            networkId = networkId||$scope.volumeDetail.networkId;
            $scope.param.page = page || $scope.param.page;
            var params = {
                    page: $scope.param.page,
                    rows: $scope.param.rows
                },
                searchParam = [];
            searchParam.push({"param":{"networkId":networkId},"sign":"EQ"});
            params.params = JSON.stringify(searchParam);
            httpLoad.loadData({
                url:'/subnet/list',
                method: 'POST',
                data: params,
                noParam: true,
                success:function(data){
                    if(data.success&&data.data.rows&&data.data.rows.length!=0){
                        $scope.subnetList = data.data.rows;
                        $scope.totalCount = data.data.total;
                        $scope.isImageData = false;
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
        localStorage.setItem('vmtabLocation', JSON.stringify('networkDetail'));
    };
}]);
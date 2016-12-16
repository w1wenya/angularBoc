angular.module('app').controller('vmUpdateCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源管理 > 平台管理';
    $scope.param = {
        rows: 10
    };
    $scope.showDetail = 2;
    //OPENSTACK1,阿里云显示2
    var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
    switch(vmTabvendor.type){
        case 'OPENSTACK':
            $scope.showOpenstack=1;
            break;
        case 'JDYUN':
            $scope.showJD = 1;
            break;
        case 'ALIYUN':
            $scope.showAli=1;
            break;
        case 'VMWARE':
            $scope.showOpenstack=1;
            break;
    }

    $scope.goBack = function(){
        $state.go('app.assets.vmTab',{id:$stateParams.id});
        sessionStorage.setItem('vmtabLocation', JSON.stringify('vmUpdate'));
    };
}]);

angular.module('app').controller('vmUpdateOpenstackCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams','$modal',function($rootScope, $scope,$state,httpLoad,$stateParams,$modal) {
    $rootScope.link = '/statics/css/user.css';
    //$rootScope.moduleTitle = '资源中心 > 虚机管理';
    //$scope.param = {
    //    rows: 10
    //};
    (function(){
        $scope.updateData = {};$scope.account = 'root';
        //获取可用区域数据
        $scope.getRegion = function(regionList){
            httpLoad.loadData({
                url:'/region/list',
                method: 'POST',
                data: {"id":$stateParams.id},
                success:function(data){
                    if(data.success){
                        $scope.regionData = data.data;
                        angular.forEach($scope.regionData, function(data,index){
                            data.isRegionActive = false;
                            for(var a in regionList){
                                if(regionList[a]==data.id) data.isRegionActive = true;
                            }
                        });
                    }
                }
            });
        };
        //获取镜像数据
        $scope.getImageData = function(){
            var params = {
                    simple : true
                },
                searchParam = [{"param":{"vendorId":$stateParams.id},"sign":"EQ"}];
            params.params = JSON.stringify(searchParam);
            httpLoad.loadData({
                url:'/image/list',
                method:'POST',
                data: params,
                noParam: true,
                success:function(data){
                    if(data.success){
                        $scope.imageList = data.data.rows;
                    }
                }
            });
        };
        //获取网络数据
        $scope.getNetworkData = function(networkId){
            var params = {
                    simple : true
                },
                searchParam = [{"param":{"vendorId":$stateParams.id},"sign":"EQ"}];
            params.params = JSON.stringify(searchParam);
            httpLoad.loadData({
                url:'/network/list',
                method:'POST',
                data: params,
                noParam: true,
                success:function(data){
                    if(data.success){
                        $scope.networkList = data.data.rows;
                        if((networkId+"").indexOf(",") != -1){
                            var netData = networkId.split(',');
                            angular.forEach($scope.networkList, function(data,index){
                                data.isNetworkActive = false;
                                angular.forEach(netData, function(data1,index1){
                                    if(data.id==data1) data.isNetworkActive = true;
                                });
                            });
                        }else{
                            angular.forEach($scope.networkList, function(data,index){
                                data.isNetworkActive = false;
                                if(data.id==networkId) data.isNetworkActive = true;
                            });
                        }
                    }
                }
            });
        };
        //获取配置实例数据
        $scope.getSizeData = function(){
            var params = {
                    simple : true
                },
                searchParam = [{"param":{"vendorId":$stateParams.id},"sign":"EQ"}];
            params.params = JSON.stringify(searchParam);
            httpLoad.loadData({
                url:'/flavor/list',
                method: 'POST',
                data: params,
                noParam: true,
                success:function(data){
                    if(data.success){
                        $scope.sizeList = data.data.rows;
                    }
                }
            });
        };

        //获取详情数据反显
        $scope.getDetail = function(){
            var id = $stateParams.vmId;
            httpLoad.loadData({
                url:'/vm/detail',
                method:'GET',
                data: {id: id},
                success:function(data){
                    if(data.success&&data.data){
                        $scope.vmDetail = data.data;
                        var updateItem = ['id','name','region','moreProp','account','cpu','memory','disk','managerIp','managerPort','remark','vendorId','flavorId','networkId','imageId'];
                        for(var a in updateItem){
                            var item = updateItem[a];
                            $scope.updateData[item] = $scope.vmDetail[item];
                        }
                        $scope.updateData.password = $scope.vmDetail.password;
                        var regionList = [];
                        $scope.updateData.region = $scope.updateData.region +"";
                        if($scope.updateData.region.indexOf()<0)  regionList.push($scope.updateData.region);
                        else  regionList = $scope.updateData.region.split(',');

                        //选择CPU核数和内存大小
                        $scope.slider = {
                            value : $scope.updateData.cpu,
                            options: {
                                showTicks: true,
                                readOnly: true,
                                stepsArray : [
                                    {value:"1"},
                                    {value:"2"},
                                    {value:"4"},
                                    {value:"8"},
                                    {value:"16"}
                                ],
                                translate: function(value) {
                                    return value+'核';
                                },
                                onChange : function(sliderId, modelValue, highValue, pointerType){
                                    var str = modelValue;
                                    $scope.updateData.cpu = str.substring(0,str.length-1);
                                }
                            }
                        };
                        $scope.slider1 = {
                            value : $scope.updateData.memory,
                            options: {
                                showTicks: true,
                                readOnly: true,
                                stepsArray : [
                                    {value: 0.5},
                                    {value: 2},
                                    {value: 4},
                                    {value: 6},
                                    {value: 8},
                                    {value: 16}
                                ],
                                translate: function(value) {
                                    return value+'G';
                                },
                                onChange : function(sliderId, modelValue, highValue, pointerType){
                                    //var str = modelValue;
                                    //$scope.updateData.memory = str.substring(0,str.length-1);
                                }
                            }
                        };

                        //获取可用区域数据
                        $scope.getRegion(regionList);
                        //获取镜像数据
                        $scope.getImageData();
                        //获取网络数据
                        $scope.getNetworkData($scope.vmDetail.networkId);
                        //获取配置实例数据
                        $scope.getSizeData();
                    }
                }
            });
        };
        if($scope.showOpenstack==1) $scope.getDetail();

        //选择可用区域
        $scope.chooseRegion = function(item){
            angular.forEach($scope.regionData, function(data,index){
                data.isRegionActive = false;
                if(data.id==item.id){
                    data.isRegionActive = !item.isRegionActive;
                }
                if(data.isRegionActive){
                    $scope.updateData.region = data.id;
                }
            });
        };
        //选择镜像
        //$scope.selectImage = function(){
        //    if($scope.updateData.imageId==undefined) return;
        //    angular.forEach($scope.imageList, function(data,index){
        //        if(data.id==$scope.updateData.imageId){
        //            $scope.updateData.osName = data.value;
        //            //$scope.updateData.osVersion = data.osVersion;
        //        }
        //    });
        //};
        //选择配置实例
        $scope.selectSize = function(row){
            if(row==undefined) return;
            if(row!=""){
                var data = JSON.parse(row);
                $scope.updateData.flavorId = data.id;
                $scope.updateData.disk = data.disk+'';
                $scope.slider.value = data.cpu+'';$scope.updateData.cpu = data.cpu+'';
                $scope.slider1.value = data.memory/1024;$scope.updateData.memory = data.memory;
                $scope.isselectSize = true;$scope.slider.options.readOnly = true;$scope.slider1.options.readOnly = true;
            }
        };
        $scope.ok = function(){
            var param = {
                id: $scope.updateData.id,
                name: $scope.updateData.name,
                tags: $scope.updateData.tags,
                remark: $scope.updateData.remark,
                moreProp: $scope.updateData.moreProp
            };
            httpLoad.loadData({
                url:'/vm/modify',
                method:'POST',
                data: param,
                success:function(data){
                    if(data.success){
                        $scope.pop("虚机编辑成功");
                        $scope.goBack();
                    }
                }
            });
        };
        $scope.cancel = function(){
            $scope.goBack();
        };
    })();
}]);
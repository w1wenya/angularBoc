angular.module('app').controller('addVolumeModalCtrl2', ['$rootScope', '$scope','$state','httpLoad','$stateParams','$modal',function($rootScope, $scope,$state,httpLoad,$stateParams,$modal) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源中心 > 云硬盘管理';
    $scope.param = {
        rows: 10
    };
    $scope.showDetail = 1;
    //京东云1,阿里云显示2
    var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
    if(vmTabvendor.type == 'JDYUN'){
        $scope.showJd = 1;
    }else if(vmTabvendor.type == 'ALIYUN'){
        $scope.showAli = 1;
    }

    (function(){
        $scope.addData = {};$scope.param={};$scope.diskMin = 5;$scope.diskMax = 2000;
        if(vmTabvendor.type == 'JDYUN'){
            $scope.typeData1 = [{"value":"EFFICIENCY","name":"高效云盘","isTypeActive":true},{"value":"SSD","name":"SSD云盘","isTypeActive":false}];
        }else if(vmTabvendor.type == 'ALIYUN'){
            $scope.typeData2 = [{"value":"EFFICIENCY","name":"高效云盘","isTypeActive":false},{"value":"SSD","name":"SSD云盘","isTypeActive":false},{"value":"CLOUD","name":"普通云盘","isTypeActive":true}];
        }
        //设置容量(京东云)
        if(vmTabvendor.type == 'JDYUN'){
            $scope.addData.size = 20;
        }
        $scope.slider1 = {
            value: 20,
            options: {
                showTicks: false,
                floor: 20,
                ceil: 3000,    //京东云的，如果是高效云盘，容量是20G-3000G，如果是SSD云盘，容量是20-1000G
                step: 1,
                translate: function(value) {
                    return value+'GB';
                },
                onChange : function(sliderId, modelValue, highValue, pointerType){
                    $scope.addData.size = modelValue;
                }
            }
        };
        //获取地域数据
        $scope.getRegion = function(){
            httpLoad.loadData({
                url:'/region/list',
                method: 'POST',
                data: {"id":$stateParams.id},
                success:function(data){
                    if(data.success){
                        $scope.regionData = data.data;
                        angular.forEach($scope.regionData, function(data,index){
                            //默认选中第一个区域
                            if(index==0){
                                data.isRegionActive = true;
                                $scope.addData.region = data.id;
                                if($scope.showAli == 1)  $scope.getAvailableRegion(data.regionId);
                            }
                            else data.isRegionActive = false;
                        });
                    }
                }
            });
        };
        $scope.getRegion();
        //获取可用区数据
        $scope.getAvailableRegion = function(regionId){
            var params = {
                simple: true
            },
            searchParam = [{"param":{"regionId":regionId},"sign":"EQ"}];
            params.params = JSON.stringify(searchParam);
            httpLoad.loadData({
                url:'/zone/list',
                method: 'POST',
                data: params,
                noParam: true,
                success:function(data){
                    if(data.success){
                        $scope.availableRegion = data.data.rows;
                        angular.forEach($scope.availableRegion, function(data,index){
                            //默认选中第一个可用区
                            if(index==0) $scope.addData.zone = data.value;
                        });
                    }
                }
            });
        };
        //设置容量(阿里云)
        $scope.setDiskRange = function(){
            if($scope.addData.type=='EFFICIENCY'){
                $scope.diskMin = 20;$scope.diskMax = 2048;
            }else if($scope.addData.type=='SSD'){
                $scope.diskMin = 20;$scope.diskMax = 1024;
            }else if($scope.addData.type=='CLOUD'){
                $scope.diskMin = 5;$scope.diskMax = 2000;
            }
        };
        //选择地域
        $scope.chooseRegion = function(item){
            angular.forEach($scope.regionData, function(data,index){
                data.isRegionActive = false;
                if(data.id==item.id){
                    data.isRegionActive = !item.isRegionActive;
                }
                if(data.isRegionActive){
                    $scope.addData.region = data.id;
                    if($scope.showAli == 1)  $scope.getAvailableRegion(data.regionId);
                }
            });
        };
        //选择类型
        $scope.chooseType = function(item){
            if($scope.showJd == 1){
                angular.forEach($scope.typeData1, function(data,index){
                    data.isTypeActive = false;
                    if(data.value==item.value){
                        data.isTypeActive = !item.isTypeActive;
                    }
                    if(data.isTypeActive){
                        $scope.addData.category = data.value;
                    }
                });
                //设置京东云的容量范围
                if($scope.addData.type=='EFFICIENCY'){
                    $scope.slider1.options.ceil = 3000;
                    $scope.slider1.value = 20;
                }else if($scope.addData.type=='SSD'){
                    $scope.slider1.options.ceil = 1000;
                    $scope.slider1.value = 20;
                }
            }
            if($scope.showAli == 1){
                angular.forEach($scope.typeData2, function(data,index){
                    data.isTypeActive = false;
                    if(data.value==item.value){
                        data.isTypeActive = !item.isTypeActive;
                    }
                    if(data.isTypeActive){
                        $scope.addData.category = data.value;
                    }
                });
                //设置阿里云的容量范围
                $scope.setDiskRange();
            }
        };
        //检查容量范围是否在范围以内（阿里云）
        $scope.checkDiskRange = function(){
            if($scope.addData.size < $scope.diskMin) $scope.addData.size = $scope.diskMin;
            if($scope.addData.size > $scope.diskMax) $scope.addData.size = $scope.diskMax;
        };
        //数量增减
        $scope.addData.count = 1;
        $scope.overdue = function(){
            if($scope.addData.count>1){
                $scope.addData.count--;
            }
        };
        $scope.add = function(){
            if($scope.addData.count<250){
                $scope.addData.count++;
            }
        };

        $scope.ok = function(){
            $scope.addData.id = $stateParams.id;
            if(vmTabvendor.type == 'JDYUN'){
                angular.forEach($scope.typeData1, function(data,index){
                    if(data.isTypeActive){
                        $scope.addData.category = data.value;
                    }
                });
            }else if(vmTabvendor.type == 'ALIYUN'){
                angular.forEach($scope.typeData2, function(data,index){
                    if(data.isTypeActive){
                        $scope.addData.category = data.value;
                    }
                });
            }
            if(!$scope.addData.region){
                $scope.pop('请选择地域','error');
                return;
            }
            httpLoad.loadData({
                url:'/volume/create',
                method:'POST',
                data: $scope.addData,
                success:function(data){
                    if(data.success){
                        $scope.pop('云硬盘新增成功');
                        $scope.goBack();
                    }
                }
            });
        };
        $scope.cancel = function(){
            $scope.goBack();
        };
    })();
    $scope.goBack = function(){
        $state.go('app.assets.vmTab',{id:$stateParams.id});
        sessionStorage.setItem('vmtabLocation', JSON.stringify('volume'));
    };
}]);
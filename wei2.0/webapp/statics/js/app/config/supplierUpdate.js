app.controller('supplierUpdateCtrl', ['$rootScope', '$scope', 'httpLoad', '$state','$stateParams',function($rootScope, $scope, httpLoad, $state,$stateParams) {
    $rootScope.moduleTitle = '配置中心 > 平台管理';
    $rootScope.link = '/statics/css/log.css';//引入页面样式
    $scope.title = "编辑平台";
    var id = $stateParams.id;

    $scope.typeData = ["OPENSTACK","VMWARE","ALIYUN","JDYUN"];
    //check 名称
    $scope.checkusername = function(){
        if(!$scope.updateData.CloudVendor.name) return;
        if($scope.updateData.CloudVendor.name=="") return;
        httpLoad.loadData({
            url:'/cloudVendor/checkName',
            method:'POST',
            data: {"name":$scope.updateData.CloudVendor.name},
            success:function(data){
                if(data.success){
                    $scope.updateSupplierForm.$invalid = false;
                }else{
                    //$scope.pop(data.message,'error');
                    $scope.updateSupplierForm.$invalid = true;
                    $scope.updateData.CloudVendor.name = "";
                }
            }
        });
    };
    //选择服务类型
    $scope.chooseNetwork = function(item,$index){
        $scope.categoryData[$index].isNetworkActive = !$scope.categoryData[$index].isNetworkActive;
    };

    $scope.settingList = [];
    $scope.updateData = {};$scope.updateData.CloudVendor={};
    $scope.categoryData = [{"name":"计算服务","value":"COMPUTER","isNetworkActive":true},{"name":"对象存储","value":"OSS","isNetworkActive":false},{"name":"数据库","value":"DATABASE","isNetworkActive":false}];
    $scope.updateData.CloudVendor.category = "COMPUTER";
    (function(){
        var list = ["id","name","type","tenant","account","password","address","remark","accessKey","secretKey","category"];
        httpLoad.loadData({
            url: '/cloudVendor/detail',
            method: 'GET',
            data: {id: id},
            success: function(data){
                if(data.success){
                    var data = data.data;
                    for(var i=0;i<list.length;i++){
                        var name = list[i];
                        $scope.updateData.CloudVendor[name] = data[name];
                    }
                }
            }
        });
        //单独获取区域数据
        httpLoad.loadData({
            url:'/region/list',
            method: 'POST',
            data: {id:id},
            success:function(data){
                if(data.success){
                    angular.forEach(data.data, function(data,index){
                        $scope.settingList.push({"name":data.name,"code":data.code,"id":data.id});
                    });
                }
            }
        });
    })();
    $scope.addSetting = function(){
        $scope.settingList.push({});
    };
    $scope.removeSetting = function(key){
        if($scope.settingList.length == 1) return $scope.pop('请至少添加一个区域','error');
        $scope.settingList.splice(key,1);
    };
    $scope.save = function(){
        if(!$scope.updateData.CloudVendor.type){
            $scope.pop('请选择类型','error');
            return;
        }
        //处理服务类型数据
        $scope.updateData.CloudVendor.category = '';
        angular.forEach($scope.categoryData, function(data,index){
            if(data.isNetworkActive==true){
                $scope.updateData.CloudVendor.category = $scope.updateData.CloudVendor.category + ',' + data.value;
            }
        });
        $scope.updateData.CloudVendor.category = $scope.updateData.CloudVendor.category.substr(1);
        if($scope.updateData.CloudVendor.category == ''){
            $scope.pop('请选择服务类型','error');
            return;
        }
        //处理区域数据
        var config = {};
        var flag;
        $scope.settingList.forEach(function(item){
            if(config[item.key]) {
                $scope.pop('区域名称为['+item.key+']存在重复项，请处理','error');
                flag = true;
                return;
            }
            config[item.key] = item.value;
        });
        if(flag) return;
        $scope.updateData.region = $scope.settingList;

        httpLoad.loadData({
            url:'/cloudVendor/modify',
            method:'POST',
            data: $scope.updateData,
            success:function(data){
                if(data.success){
                    $scope.pop('平台编辑成功');
                    $scope.goBack();
                }
            }
        });
    };
    $scope.goBack = function(){
        $state.go('app.config.cloudVendor');
    }
}])

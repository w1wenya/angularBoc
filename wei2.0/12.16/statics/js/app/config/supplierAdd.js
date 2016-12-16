app.controller('supplierAddCtrl', ['$rootScope', '$scope', 'httpLoad', '$state',function($rootScope, $scope, httpLoad, $state) {
    $rootScope.moduleTitle = '配置中心 > 平台管理';
    $rootScope.link = '/statics/css/log.css';//引入页面样式
    $scope.title = "新增平台";

    $scope.addData={};$scope.addData.CloudVendor={};
    $scope.typeData = ["OPENSTACK","VMWARE","ALIYUN","JDYUN"];
    $scope.categoryData = [{"name":"计算服务","value":"COMPUTER","isNetworkActive":true},{"name":"对象存储","value":"OSS","isNetworkActive":false},{"name":"数据库","value":"DATABASE","isNetworkActive":false}];
    //$scope.addData.CloudVendor.category = "COMPUTER";
    //check 名称
    $scope.checkusername = function(){
        if(!$scope.addData.CloudVendor.name) return;
        if($scope.addData.CloudVendor.name=="") return;
        httpLoad.loadData({
            url:'/cloudVendor/checkName',
            method:'POST',
            data: {"name":$scope.addData.CloudVendor.name},
            success:function(data){
                if(data.success){
                    $scope.addSupplierForm.$invalid = false;
                }else{
                    //$scope.pop(data.message,'error');
                    $scope.addSupplierForm.$invalid = true;
                    $scope.addData.CloudVendor.name = "";
                }
            }
        });
    };
    //选择服务类型
    $scope.chooseNetwork = function(item,$index){
        $scope.categoryData[$index].isNetworkActive = !$scope.categoryData[$index].isNetworkActive;
    };

    $scope.settingList = [{}];
    $scope.addSetting = function(){
        $scope.settingList.push({});
    };
    $scope.removeSetting = function(key){
        if($scope.settingList.length == 1) return $scope.pop('请至少添加一个区域','error');
        $scope.settingList.splice(key,1);
    };
    $scope.save = function(){
        if(!$scope.addData.CloudVendor.type){
            $scope.pop('请选择类型','error');
            return;
        }
        //处理服务类型数据
        //$scope.addData.CloudVendor.category = '';
        //angular.forEach($scope.categoryData, function(data,index){
        //    if(data.isNetworkActive==true){
        //        $scope.addData.CloudVendor.category = $scope.addData.CloudVendor.category + ',' + data.value;
        //    }
        //});
        //$scope.addData.CloudVendor.category = $scope.addData.CloudVendor.category.substr(1);
        //if($scope.addData.CloudVendor.category == ''){
        //    $scope.pop('请选择服务类型','error');
        //    return;
        //}
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
        $scope.addData.region = $scope.settingList;

        httpLoad.loadData({
            url: '/cloudVendor/create',
            method: 'POST',
            data: $scope.addData,
            success: function(data){
                if(data.success){
                    $scope.pop('平台添加成功');
                    $scope.goBack();
                }
            }
        });
    };
    $scope.goBack = function(){
        $state.go('app.config.cloudVendor');
    }
}])

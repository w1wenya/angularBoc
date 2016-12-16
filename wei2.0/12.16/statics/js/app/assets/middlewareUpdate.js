angular.module('app').controller('middlewareUpdateCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams','$modal',function($rootScope, $scope,$state,httpLoad,$stateParams,$modal) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源管理 > 中间件管理';
    $scope.param = {
        rows: 10
    };
    $scope.showDetail = 2;
    $scope.goBack = function(){
        $state.go('app.assets.middleware');
    };

    (function(){
        $scope.updateData = {};$scope.param={};

        $scope.datePicker = {};$scope.datePicker.date;
        $scope.dateRangeOptions = {
            timePicker: true,
            format: 'YYYY-MM-DD hh:mm:ss'
        };
        //处理时间
        var toFormatTime = function(time, place) {
            if (!time) return "";
            var date = time.split(' - ');
            return date[place/1];
        };
        //状态数据
        $scope.typeData = [{"value":"WEBLOGIC","name":"weblogic"},{"value":"DB2","name":"db2"},{"value":"SUSPENDED","name":"sybase"},{"value":"SQLSERVER","name":"sqlserver"},{"value":"MONGODB","name":"mongodb"},{"value":"ZOOKEEPER","name":"zookeeper"},{"value":"MQ","name":"mq"}];
        httpLoad.loadData({
            url: '/middleware/detail',
            method: 'GET',
            data: {id: $stateParams.id},
            success: function (data) {
                if (data.success && data.data) {
                    $scope.middlewareDetail = data.data;
                    var list = ["assetNum","serviceVendor","contact","startTime","endTime","contractNum","name","address","applicationSystem","xcode","version","category","ip","port","username","password","remark"];
                    for(var i=0;i<list.length;i++){
                        var item = list[i];
                        $scope.updateData[item] = $scope.middlewareDetail[item];
                    }
                    if($scope.updateData.startTime&&$scope.updateData.endTime){
                        $scope.datePicker.date = $scope.updateData.startTime + ' - ' + $scope.updateData.endTime;
                    }
                }
            }
        });

        $scope.ok = function(){
            $scope.updateData.id = $stateParams.id;
            if(!$scope.updateData.category||$scope.updateData.category==""){
                $scope.pop('请选择类别','error');
                return;
            }
            if($scope.datePicker.date){
                $scope.updateData.startTime = toFormatTime($scope.datePicker.date, 0);
                $scope.updateData.endTime = toFormatTime($scope.datePicker.date, 1);
            }
            httpLoad.loadData({
                url:'/middleware/modify',
                method:'POST',
                data: $scope.updateData,
                success:function(data){
                    if(data.success){
                        $scope.pop("中间件编辑成功");
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
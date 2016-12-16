angular.module('app').controller('middlewareAddCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams','$modal',function($rootScope, $scope,$state,httpLoad,$stateParams,$modal) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '资源管理 > 中间件管理';
    $scope.param = {
        rows: 10
    };
    $scope.showDetail = 1;
    $scope.goBack = function(){
        $state.go('app.assets.middleware');
    };

    (function(){
        $scope.addData = {};$scope.param={};

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
        $scope.ok = function(){
            if(!$scope.addData.category||$scope.addData.category==""){
                $scope.pop('请选择类别','error');
                return;
            }
            if($scope.datePicker.date){
                $scope.addData.startTime = toFormatTime($scope.datePicker.date, 0);
                $scope.addData.endTime = toFormatTime($scope.datePicker.date, 1);
            }
            httpLoad.loadData({
                url:'/middleware/create',
                method:'POST',
                data: $scope.addData,
                success:function(data){
                    if(data.success){
                        $scope.pop("中间件添加成功");
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
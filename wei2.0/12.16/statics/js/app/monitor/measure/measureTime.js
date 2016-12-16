app.controller('MonitorMeasureUploadCtrl', ['$rootScope', '$scope', '$modal', 'httpLoad', '$state', '$stateParams','LANGUAGE',function($rootScope, $scope, $modal, httpLoad, $state, $stateParams, LANGUAGE) {
    $rootScope.moduleTitle = '参数管理 > 采集间隔下发';
    $rootScope.link = '/statics/css/monitor.css';//引入页面样式
    $scope.settingList = [];$scope.settingNewList = [];
    $scope.actionTypeData = [{"value":"ADD","name":"增加"},{"value":"MOD","name":"修改"},{"value":"DEL","name":"删除"}];
    (function(){
        //获取执行账户列表
        httpLoad.loadData({
            url: '/ident/list',
            noParam: true,
            data: {
                simple: true
            },
            success: function (data) {
                if (data.success) {
                    $scope.accountData = data.data.rows;
                    for (var a in $scope.accountData) {
                        var data = $scope.accountData[a];
                        data.name = data.username;
                        if (data.remark) {
                            data.name = data.username + '(' + data.remark + ')';
                        }
                    }
                }
            }
        });
    })();
    //选择服务器
    $scope.selectServer = function () {
        var modalInstance = $modal.open({
            templateUrl: '/statics/tpl/operation/newtask/selectServerModal.html',
            controller: 'selectServerModalCtrl',
            backdrop: 'static',
            size:'lg',
            resolve: {
                selectList:function(){
                    return angular.toJson($scope.serverListData || []);
                }
            }
        });
        modalInstance.result.then(function (data) {
            $scope.serverListData = data;
            if (data.length > 0) $scope.isShowServer = true;
            $scope.totalSelect = $scope.serverListData.length;
        });
    };
    //删除选择的服务器
    $scope.delServer = function (key) {
        $scope.serverListData.splice(key, 1);
        $scope.totalSelect = $scope.serverListData.length;
    };
    $scope.save = function(){
        if(!$scope.actionType||$scope.actionType=="") return $scope.pop('请选择操作类别','error');
        var ipList = [];
        for(var a in $scope.serverListData){
            var data = $scope.serverListData[a];
            ipList.push({id:data.id,ip:data.ip})
        }
        if(ipList.length == 0) return $scope.pop('请选择目标机器','error');
        //var postData = {
        //    id:$stateParams.id,
        //    name: $scope.name,
        //    identId: $scope.identId,
        //    targets:ipList,
        //    type:'CONFIG',
        //    script: {
        //        content:$scope.content
        //    }
        //}
        var postData = {
            targets:ipList,
            interval:$scope.interval,
            actionType:$scope.actionType
        };
        httpLoad.loadData({
            url: '/measure/uploadInterval',
            method: 'POST',
            data: postData,
            success: function(data){
                if(data.success){
                    $scope.pop(LANGUAGE.MONITOR.MONITOR_UPLOAD.TIME_SUCCESS);
                    $state.go('app.config.measure');
                }
            }
        });
    };
    $scope.goBack = function(){
        $state.go('app.config.measure');
    }
}])
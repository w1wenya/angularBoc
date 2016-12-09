angular.module('app').controller('resourceGroupDetailCtrl', ['$rootScope', '$scope','$state','httpLoad','$stateParams',function($rootScope, $scope,$state,httpLoad,$stateParams) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '系统管理 > 分组管理';
    (function(){
        $scope.itemsByPage = 8;//定义每页的条数
        //加载列表
        var loadData = function(){
            httpLoad.loadData({
                url:'/res/group/detail',
                method:'GET',
                data: {id: $stateParams.id},
                success:function(data){
                    if(data.success){
                        $scope.resourceDetail = data.data;
                        $scope.showDetail = $scope.isActive = true;
                    }
                }
            });
            httpLoad.loadData({
                url:'/res/group/listRes',
                method:'POST',
                data:{
                    id:$stateParams.id
                },
                success:function(data){
                    if(data.success){
                        $scope.userListData= data.data;
                        $scope.total = data.data.length;
                    }
                }
            });
        };
        loadData();
    })();
    $scope.goBack = function(){
        $state.go('app.userCenter.group');
        localStorage.setItem('grouptabLocation', JSON.stringify('resourceGroup'));
    };
}]);
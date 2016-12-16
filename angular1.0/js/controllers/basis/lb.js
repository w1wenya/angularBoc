materialAdmin
	.controller('HostCtrl',	function($rootScope, $scope, httpLoad,$uibModal,$state) {
	$rootScope.moduleTitle = '资源中心 > 主机管理';
	$scope.totalCount = 1;
	//高级查询配置
        $scope.isHost = true;
        $scope.isNetwork = false;
        $scope.isStorage = false;
	//参数选项
	$scope.param = {
		rows: 8,
		page: 1
	};
        //获取主机列表数据
        $scope.getHostList = function(page){
            $scope.param.page = page || $scope.param.page;
            httpLoad.loadData({
                url: '/host/list',
                data: $scope.param,
                success: function(data){
                    if(data.success){
                        $scope.hostListData = data.rows;

                        $scope.totalCount = data.total;
                        angular.forEach($scope.hostListData, function(data,index){
                            data.isChose = false;
                        });
                    }
                }
            });
        };
        $scope.getHostList(1);
        //添加/编辑主机
        $scope.add = function($event,id){
            $event.stopPropagation();
            var modalInstance = $uibModal.open({
                templateUrl: '/views/basis/host/addHostModal.html',
                controller: 'addHostModalCtrl',
                size:'md',
                backdrop: 'static',
                resolve: {
                    id: function() {
                        return id;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                $scope.getHostList();
            });
        }
        //删除主机
        $scope.remove = function (id,$event){
            if($event) $event.stopPropagation();
            var modalInstance = $uibModal.open({
                templateUrl: '/views/basis/host/delHostModal.html',
                controller: 'delModalCtrl',
                backdrop: 'static',
                resolve: {
                    id: function() {
                        return  id;
                    },
                }
            });
            modalInstance.result.then(function() {
                $scope.getHostList();
                $scope.isCheck = true;
                $scope.isbacthmanage = false;
                angular.forEach($scope.hostListData, function(data,index){
                    data.isChose = false;
                });
            });
        }
        //跳转详情页
        $scope.goDetail = function($event,id){
            $state.go('basis.hostDetail',{id:id})
        };

})
//添加/编辑主机ctrl
materialAdmin.controller('addHostModalCtrl', ['$scope', '$uibModalInstance', 'httpLoad', 'id',
    function($scope, $uibModalInstance,  httpLoad, id) {
        //编辑对象
        var editObj = ['type','name','remark','osAccount','osPassword'];
        $scope.modalName = '添加主机';
        var url = '/host/create';
        //如果为编辑，进行赋值
        if(id){
            $scope.itemDisabled = true;
            url = '/host/modify';
            $scope.modalName = '编辑主机';
            httpLoad.loadData({
                url: '/host/basic',
                method: 'GET',
                data: {id: id},
                success: function(data){
                    if(data.success){
                        var data = data.data;
                        for(var a in editObj){
                            var attr = editObj[a];
                            $scope[attr] = data[attr];
                        }
                    }
                }
            });
        }

        //保存按钮
        $scope.ok = function(){
            var param = {};
            for(var a in editObj){
                var attr = editObj[a];
                param[attr] = $scope[attr];
            }
            if(id) param.id = id;
            httpLoad.loadData({
                url: url,
                data: param,
                success: function(data){
                    if(data.success){
                        $scope.pop(id);
                        $uibModalInstance.close(param);
                    }
                }
            });
        }
        $scope.cancle = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
])
//删除机房ctrl
materialAdmin.controller('delModalCtrl', ['$scope', '$uibModalInstance', 'httpLoad',  'id',
    function($scope, $uibModalInstance, httpLoad, id) {
        $scope.moduleMessages='你确定要删除这个主机吗？';
        $scope.ok = function(){
            httpLoad.loadData({
                url: '/host/remove',
                data: {id: id},
                success: function(data){
                    if(data.success){
                        $scope.pop(data.message);
                        $uibModalInstance.close();
                    }
                }
            });
        }
        $scope.cancle = function(){
            $uibModalInstance.dismiss('cancel');
        };
    }
]);

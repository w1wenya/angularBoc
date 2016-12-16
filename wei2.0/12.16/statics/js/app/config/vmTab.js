(function(){
    app.controller('vmTabCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '资源管理 > 平台管理';//定义当前页
            $rootScope.link = '/statics/css/user.css';

            var vmtabLocation = JSON.parse(sessionStorage.getItem('vmtabLocation'));
            $scope.active1 = $scope.active2 = $scope.active3 = $scope.active4 = $scope.active5 = $scope.active6= $scope.active7= $scope.active9= $scope.active10 = false;
            if(vmtabLocation.indexOf("image")>=0) $scope.active2 = true;
            else if(vmtabLocation.indexOf("volume")>=0) $scope.active3 = true;
            else if(vmtabLocation.indexOf("snapshot")>=0) $scope.active4 = true;
            else if(vmtabLocation.indexOf("size")>=0) $scope.active5 = true;
            else if(vmtabLocation.indexOf("network")>=0) $scope.active6 = true;
            else if(vmtabLocation.indexOf("security")>=0) $scope.active7 = true;
            //else if(vmtabLocation.indexOf("subnet")>=0) $scope.active8 = true;
            else if(vmtabLocation.indexOf("bucket")>=0) $scope.active9 = true;
            else if(vmtabLocation.indexOf("vmTemplate")>=0) $scope.active10 = true;
            else $scope.active1 = true;

            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            switch(vmTabvendor.type){
                case 'OPENSTACK':
                    $scope.isShowvm = $scope.isShowaccount = $scope.isShowvolume = $scope.isShowsnapshot = $scope.isShowsize = $scope.isShownetwork = true;
                    $scope.isShowsecurity = false;$scope.isShowbucket = false;$scope.isShowTemplatevm =false;
                    break;
                case 'JDYUN':
                    $scope.isShowvm = $scope.isShowaccount = $scope.isShowvolume = $scope.isShowsecurity = true;
                    $scope.isShowsnapshot = $scope.isShowsize = $scope.isShownetwork = false;$scope.isShowbucket = false;$scope.isShowTemplatevm =false;
                    break;
                case 'ALIYUN':
                    $scope.isShowvm = $scope.isShowaccount = $scope.isShowvolume = $scope.isShowsecurity = true;$scope.isShowbucket = true;
                    $scope.isShowsnapshot = $scope.isShowsize = $scope.isShownetwork = false;$scope.isShowTemplatevm =false;
                    break;
                case 'VMWARE':
                    $scope.isShowvm = true;$scope.isShowTemplatevm = true;
                    $scope.isShowaccount = $scope.isShowvolume = $scope.isShowsnapshot = $scope.isShowsize = $scope.isShownetwork = $scope.isShowsecurity = false;$scope.isShowbucket = false;
                    break;
                default:
                    $scope.isShowvm = true;
                    $scope.isShowaccount = $scope.isShowvolume = $scope.isShowsnapshot = $scope.isShowsize = $scope.isShownetwork = $scope.isShowsecurity = false;$scope.isShowbucket = false;$scope.isShowTemplatevm =false;
            }

            $scope.goBack = function(){
                $state.go('app.assets.vm');
            };
        }
    ]);
    app.controller('vmListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 平台管理';//定义当前页
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            //获取云主机列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [{"param":{"vendorId":vmTabvendor.id},"sign":"EQ"}];
                if(vmTabvendor.type == 'VMWARE'){
                    searchParam = [{"param":{"vendorId":vmTabvendor.id,"isTemplate":false},"sign":"EQ"}];
                }
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                if($scope.searchByStatus&&$scope.searchByStatus!=""){
                    var a = 0;
                    for(var i=0;i<searchParam.length;i++){
                        if(searchParam[i].sign=="LK") {
                            a = 1;
                            searchParam[i].param.status = $scope.searchByStatus;
                        }
                    }
                    if(a==0) searchParam.push({"param":{"status":$scope.searchByStatus},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/vm/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.vmList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                            angular.forEach($scope.vmList, function(data,index){
                                //状态
                                data.isShowRecover = data.isRecover = data.isShowPaused = data.isPaused = data.isShowSuspended = data.isSuspended = data.isShowActive = data.isActive = data.isShowStart = data.isStart = data.isShowStop = data.isStop = false;
                                switch(data.status){
                                    case 'RUNNING':
                                        data.isShowStop = true;data.isStop = false;
                                        data.isShowRestart = true;data.isRestart = false;
                                        data.isShowStart = false;
                                        data.isShowPaused = true;data.isPaused = false;
                                        data.isShowSuspended = true;data.isSuspended = false;
                                        data.statusColor = 'success';
                                        break;
                                    case 'STOPPED':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = false;
                                        data.isShowRecover = true;data.isRecover = false;
                                        data.isShowActive = true;data.isActive = false;
                                        data.statusColor = 'warning';
                                        break;
                                    case 'STOPPING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = true;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'STARTING':
                                        data.isShowStop = true;data.isStop = true;
                                        data.isShowRestart = true;data.isRestart = false;
                                        data.isShowStart = false;
                                        data.isShowPaused = true;data.isPaused = true;
                                        data.isShowSuspended = true;data.isSuspended = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'SUSPENDED':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowActive = true;data.isActive = false;
                                        data.statusColor = 'primary';
                                        break;
                                    case 'SUSPENDING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'ACTIVING':
                                        data.isShowStop = true;data.isStop = true;
                                        data.isShowRestart = true;data.isRestart = false;
                                        data.isShowStart = false;
                                        data.isShowPaused = true;data.isPaused = true;
                                        data.isShowSuspended = true;data.isSuspended = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'PAUSED':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowRecover = true;data.isRecover = false;
                                        data.statusColor = 'warning';
                                        break;
                                    case 'PAUSING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'RECOVERING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowPaused = true;data.isPaused = true;
                                        data.isShowSuspended = true;data.isSuspended = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'PAUSING':
                                        data.isShowStop = true;data.isStop = true;
                                        data.isShowRestart = true;data.isRestart = false;
                                        data.isShowStart = false;
                                        data.statusColor = 'default';
                                        break;
                                    case 'BUILDING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = true;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'RESTARTING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowPaused = true;data.isPaused = true;
                                        data.isShowSuspended = true;data.isSuspended = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'EXPIRED':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = true;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'EXCEPTION':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = true;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'danger';
                                        break;
                                    case 'SYNSEXCEPTION':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = true;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'danger';
                                        break;
                                }
                            });
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            //openstack显示1,；京东云和阿里云显示2
            if(vmTabvendor.type == 'OPENSTACK'){
                $scope.vmTable = 1;$scope.isSyncBtn = true;$scope.isAddBtn = true;
            }else if(vmTabvendor.type == 'JDYUN'){
                $scope.vmTable = 2;$scope.isSyncBtn = true;$scope.isAddBtn = true;
            }else if(vmTabvendor.type == 'VMWARE'){
                $scope.vmTable = 3;$scope.isSyncBtn = true;$scope.isAddBtn = false;
            }else if(vmTabvendor.type == 'ALIYUN'){
                $scope.vmTable = 2;$scope.isSyncBtn = true;$scope.isAddBtn = true;
            }
            $scope.getData(1);
            //状态数据
            $scope.statusData = [{"value":"RUNNING","name":"运行中"},{"value":"STOPPED","name":"关机"},{"value":"SUSPENDED","name":"挂起"},{"value":"PAUSED","name":"停止"},{"value":"EXCEPTION","name":"异常"}];
            //返回
            $scope.goBack = function(){
                $scope.isActive = false;
                $timeout(function() {
                    $scope.showDetail = false;
                }, 200);
            };
            //跳转详情页
            $scope.detail = function(id,$event){
                //$event.stopPropagation();
                $state.go('app.assets.vmDetail',{vmId:id,id:$stateParams.id});
            };
            //新增
            $scope.add = function($event){
                $event.stopPropagation();
                $state.go('app.assets.vmAdd',{id:$stateParams.id});
            };
            //编辑
            $scope.update = function($event,$index,row,key,size){
                $event.stopPropagation();
                $state.go('app.assets.vmUpdate',{vmId:row.id,id:$stateParams.id});
            };
            //监控
            $scope.goMonitor = function(id){
                $state.go('app.monitor.vmMonitor',{id:id})
            };
            $scope.showPassword = function(value){
                $scope[value] = !$scope[value];
            };
            //删除6,备份3，快照4，恢复0，暂停7，挂起8，激活9，重启1，开机2，关机5
            $scope.remove = function($event,id,value,isAction){
                if($event) $event.stopPropagation();
                if(isAction==true) return;
                $scope.removeData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/vm/remove.html',
                    controller : 'removevmModalCtrl',
                    resolve : {
                        removeData : function(){
                            return $scope.removeData;
                        },
                        value: function(){
                            return value;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                    $timeout(function() {
                        $scope.getData();
                    }, 5000);
                },function(){});
            };
            //同步
            $scope.sync = function($event){
                var action = 1;
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/vm/sync.html',
                    controller : 'msyncVmModalCtrl',
                    resolve : {
                        action : function(){
                            return action;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
        }
    ]);
    //删除ctrl
    angular.module('app').controller('removevmModalCtrl',['$scope','$modalInstance','httpLoad','removeData','value',
        function($scope,$modalInstance,httpLoad,removeData,value){
            var url;
            //删除6,备份3，快照4，恢复0，停止7，挂起8，激活9，重启1，开机2，关机5
            if(value==0){
                $scope.actionName = '恢复';
                url = '/vm/recovery';
            }
            if(value == 1){
                $scope.actionName = '重启';
                url = '/vm/restart';
            }
            if(value == 3){
                $scope.actionName = '备份';
                url = '/vm/backup';
            }
            if(value == 4){
                $scope.actionName = '快照';
                url = '/vm/snapshoot';
            }
            if(value == 6){
                $scope.actionName = '删除';
                url = '/vm/remove';
            }
            if(value == 7){
                $scope.actionName = '停止';
                url = '/vm/pause';
            }
            if(value == 8){
                $scope.actionName = '挂起';
                url = '/vm/suspend';
            }
            if(value == 9){
                $scope.actionName = '激活';
                url = '/vm/active';
            }
            if(value == 2){
                $scope.actionName = '开机';
                url = '/vm/start';
            }
            if(value == 5){
                $scope.actionName = '关机';
                url = '/vm/stop';
            }
            $scope.ok = function(){
                httpLoad.loadData({
                    url:url,
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop("虚机"+$scope.actionName+"成功");
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);

    //同步ctrl
    angular.module('app').controller('msyncVmModalCtrl',['$rootScope','$scope','$modalInstance','httpLoad','action','$stateParams',
        function($rootScope,$scope,$modalInstance,httpLoad,action,$stateParams){
            $scope.syncData = {};$scope.modelTitle = '虚机同步';
            $scope.param = {
                rows: 6
            };
            var url,operationTxt;
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));

            switch(action){
                case 1:
                    url =  '/vm/sync';operationTxt =  '虚机同步成功';$scope.modelTitle = '虚机同步';
                    break;
                case 2:
                    url =  '/image/sync';operationTxt =  '镜像同步成功';$scope.modelTitle = '镜像同步';
                    break;
                case 3:
                    url = '/volume/sync';operationTxt = '云硬盘同步成功';$scope.modelTitle = '云硬盘同步';
                    break;
                case 4:
                    url = '/snapshot/sync';operationTxt = '快照同步成功';$scope.modelTitle = '快照同步';
                    break;
                case 5:
                    url = '/flavor/sync';operationTxt = '配置同步成功';$scope.modelTitle = '配置同步';
                    break;
                case 6:
                    url = '/network/sync';operationTxt = '网络同步成功';$scope.modelTitle = '网络同步';
                    break;
                case 7:
                    url = '/security/group/sync';operationTxt = '安全组同步成功';$scope.modelTitle = '安全组同步';
                    break;
                case 8:
                    url = '/bucket/sync';operationTxt = '对象存储同步成功';$scope.modelTitle = '对象存储同步';
                    break;
            }

            //获取可用区域数据
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
                                    $scope.syncData.region = data.id;
                                }
                                else data.isRegionActive = false;
                            });
                        }
                    }
                });
            };
            $scope.getRegion();
            //选择可用区域
            $scope.chooseRegion = function(item){
                angular.forEach($scope.regionData, function(data,index){
                    data.isRegionActive = false;
                    if(data.id==item.id){
                        data.isRegionActive = !item.isRegionActive;
                    }
                    if(data.isRegionActive){
                        $scope.syncData.region = data.id;
                    }
                });
            };
            $scope.ok = function(){
                $scope.syncData.id = $stateParams.id;
                if(!$scope.syncData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                httpLoad.loadData({
                    url:url,
                    method:'POST',
                    data: $scope.syncData,
                    success:function(data){
                        if(data.success){
                            $scope.pop(data.message);
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            };
    }]);
    app.controller('accountCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 镜像管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));

            //获取镜像列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [{"param":{"vendorId":vmTabvendor.id},"sign":"EQ"}];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/image/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.imageList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                            angular.forEach($scope.imageList, function(data,index){
                                data.status = '运行中';
                            });
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            //京东云和阿里云显示1,；openstack显示2
            if(vmTabvendor.type == 'JDYUN'||vmTabvendor.type == 'ALIYUN'){
                $scope.imageTable = 1;
            }else if(vmTabvendor.type == 'OPENSTACK'){
                $scope.imageTable = 2;
            }
            //如果Tab是当前页
            var vmtabLocation = JSON.parse(sessionStorage.getItem('vmtabLocation'));
            if(vmtabLocation.indexOf("image")>=0) $scope.getData(1);

            //同步
            $scope.sync = function($event){
                var action = 2;
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/vm/sync.html',
                    controller : 'msyncVmModalCtrl',
                    resolve : {
                        action : function(){
                            return action;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //返回
            $scope.goBack = function(){
                $scope.isActive = false;
                $timeout(function() {
                    $scope.showDetail = false;
                }, 200);
            };
            //跳转详情页
            $scope.detail = function(id,$event){
                $state.go('app.assets.imageDetail',{vmId:id,id:$stateParams.id});
            };
        }
    ]);
    app.controller('volumeCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 块设备管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            //获取块设备管理列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [{"param":{"vendorId":vmTabvendor.id},"sign":"EQ"}];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/volume/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.volumeList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                            if(vmTabvendor.type == 'OPENSTACK'){
                                angular.forEach($scope.volumeList, function(data,index){
                                    if(data.status=='AVAILABLE') data.status1 = '可用配额';
                                    else if(data.status=='IN_USE') data.status1 = '正在使用';
                                    else if(data.status=='BUILDING') data.status1 = '创建中';
                                    else data.status1 = '异常';
                                });
                            }else if(vmTabvendor.type == 'ALIYUN'||vmTabvendor.type == 'JDYUN'){
                                angular.forEach($scope.volumeList, function(data,index){
                                    if(data.status=='AVAILABLE') data.status1 = '可用配额';
                                    else if(data.status=='BUILDING') data.status1 = '创建中';
                                    else data.status1 = '正在使用';
                                });
                            }
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            //如果Tab是当前页
            var vmtabLocation = JSON.parse(sessionStorage.getItem('vmtabLocation'));
            if(vmtabLocation.indexOf("volume")>=0) $scope.getData(1);
            //openstack显示1,；京东云和阿里云显示2
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            if(vmTabvendor.type == 'OPENSTACK'){
                $scope.volumeTable = 1;
            }else if(vmTabvendor.type == 'JDYUN'){
                $scope.volumeTable = 2;
            }else if(vmTabvendor.type == 'ALIYUN'){
                $scope.volumeTable = 3;
            }

            //新增
            $scope.add = function($event){
                //openstack的新增
                if($scope.volumeTable == 1){
                    var modalInstance = $modal.open({
                        templateUrl : '/statics/tpl/assets/volume/add.html',
                        controller : 'addVolumeModalCtrl'
                    });
                    modalInstance.result.then(function(){
                        $scope.getData();
                    },function(){});
                }
                //京东云和阿里云的新增
                if($scope.volumeTable == 2||$scope.volumeTable == 3){
                    $state.go('app.assets.volumeAdd',{id:$stateParams.id});
                }

            };
            //删除
            $scope.remove = function(id,$event,$index,key){
                if($event) $event.stopPropagation();
                $scope.removeData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/volume/remove.html',
                    controller : 'removeVolumeModalCtrl',
                    resolve : {
                        removeData : function(){
                            return $scope.removeData;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };

            //跳转详情页
            $scope.detail = function(row){
                $state.go('app.assets.volumeDetail',{vmId:row.id,id:$stateParams.id});
            };
            //同步
            $scope.sync = function($event){
                var action = 3;
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/vm/sync.html',
                    controller : 'msyncVmModalCtrl',
                    resolve : {
                        action : function(){
                            return action;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addVolumeModalCtrl',['$rootScope','$scope','$modalInstance','httpLoad','$stateParams',
        function($rootScope,$scope,$modalInstance,httpLoad,$stateParams){ //依赖于modalInstance
            $scope.addData = {};
            //获取可用区域数据
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
                                }
                                else data.isRegionActive = false;
                            });
                        }
                    }
                });
            };
            $scope.getRegion();

            //选择可用区域
            $scope.chooseRegion = function(item){
                angular.forEach($scope.regionData, function(data,index){
                    data.isRegionActive = false;
                    if(data.id==item.id){
                        data.isRegionActive = !item.isRegionActive;
                    }
                    if(data.isRegionActive){
                        $scope.addData.region = data.id;
                    }
                });
            };
            $scope.ok = function(){
                $scope.addData.id = $stateParams.id;
                if(!$scope.addData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                httpLoad.loadData({
                    url:'/volume/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('云硬盘新增成功');
                            $modalInstance.close();
                        }
                    }
                });

            };

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    //删除ctrl
    angular.module('app').controller('removeVolumeModalCtrl',['$scope','$modalInstance','httpLoad','removeData',
        function($scope,$modalInstance,httpLoad,removeData){ //依赖于modalInstance
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/volume/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('云硬盘删除成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    app.controller('snapshotCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 快照管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            //获取快照管理列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [{"param":{"vendorId":vmTabvendor.id},"sign":"EQ"}];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                if($scope.searchByVolumeName&&$scope.searchByVolumeName!=""){
                    searchParam.push({"param":{"volumeName":$scope.searchByVolumeName},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/snapshot/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.snapshotList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                            angular.forEach($scope.snapshotList, function(data,index){
                                if(data.status=='AVAILABLE') data.status1 = '可用配额';
                                else if(data.status=='BUILDING') data.status1 = '创建中';
                            });
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            //如果Tab是当前页
            var vmtabLocation = JSON.parse(sessionStorage.getItem('vmtabLocation'));
            if(vmtabLocation.indexOf("snapshot")>=0) $scope.getData(1);

            //新增
            $scope.add = function($event){
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/snapshot/add.html',
                    controller : 'addSnapshotModalCtrl'
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //删除
            $scope.remove = function(id,$event,$index,key){
                if($event) $event.stopPropagation();
                $scope.removeData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/snapshot/remove.html',
                    controller : 'removeSnapshotModalCtrl',
                    resolve : {
                        removeData : function(){
                            return $scope.removeData;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //同步
            $scope.sync = function($event){
                var action = 4;
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/vm/sync.html',
                    controller : 'msyncVmModalCtrl',
                    resolve : {
                        action : function(){
                            return action;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //跳转详情页
            $scope.detail = function(id,$event){
                //$event.stopPropagation();
                $state.go('app.assets.snapshotDetail',{vmId:id,id:$stateParams.id});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addSnapshotModalCtrl',['$rootScope','$scope','$modalInstance','httpLoad','$stateParams',
        function($rootScope,$scope,$modalInstance,httpLoad,$stateParams){ //依赖于modalInstance
            $scope.addData = {};
            $scope.param = {
                rows: 6
            };
            //获取快设备数据
            $scope.getVolume = function(){
                var params = {
                        simple : true
                    },
                    searchParam = [{"param":{"vendorId":$stateParams.id},"sign":"EQ"}];
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/volume/list',
                    method:'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success){
                            $scope.volumeData = data.data.rows;
                        }
                    }
                });
            };
            $scope.getVolume();
            //获取可用区域数据
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
                                }
                                else data.isRegionActive = false;
                            });
                        }
                    }
                });
            };
            $scope.getRegion();

            //选择可用区域
            $scope.chooseRegion = function(item){
                angular.forEach($scope.regionData, function(data,index){
                    data.isRegionActive = false;
                    if(data.id==item.id){
                        data.isRegionActive = !item.isRegionActive;
                    }
                    if(data.isRegionActive){
                        $scope.addData.region = data.id;
                    }
                });
            };
            $scope.ok = function(){
                $scope.addData.id = $stateParams.id;
                if(!$scope.addData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                httpLoad.loadData({
                    url:'/snapshot/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('快照新增成功');
                            $modalInstance.close();
                        }
                    }
                });

            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    //删除ctrl
    angular.module('app').controller('removeSnapshotModalCtrl',['$scope','$modalInstance','httpLoad','removeData',
        function($scope,$modalInstance,httpLoad,removeData){ //依赖于modalInstance
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/snapshot/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('快照删除成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    app.controller('sizeCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 配置管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            //获取配置管理列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [{"param":{"vendorId":vmTabvendor.id},"sign":"EQ"}];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/flavor/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.sizeList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            //如果Tab是当前页
            var vmtabLocation = JSON.parse(sessionStorage.getItem('vmtabLocation'));
            if(vmtabLocation.indexOf("size")>=0) $scope.getData(1);

            //同步
            $scope.sync = function($event){
                var action = 5;
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/vm/sync.html',
                    controller : 'msyncVmModalCtrl',
                    resolve : {
                        action : function(){
                            return action;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };

            //跳转详情页
            $scope.detail = function(id){
                $state.go('app.assets.flavorDetail',{vmId:id,id:$stateParams.id});
            };
        }
    ]);
    app.controller('networkCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 网络管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            //获取网络管理列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [{"param":{"vendorId":vmTabvendor.id},"sign":"EQ"}];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/network/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.networkList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                            angular.forEach($scope.networkList, function(data,index){
                                if(data.status=='RUNNING') data.status1 = '运行中';
                                else data.status1 = '异常';
                                if(data.shared==true) data.shared1 = '是';
                                if(data.shared==false) data.shared1 = '否';
                            });
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            //如果Tab是当前页
            var vmtabLocation = JSON.parse(sessionStorage.getItem('vmtabLocation'));
            if(vmtabLocation.indexOf("network")>=0) $scope.getData(1);
            //openstack显示1,；京东云和阿里云显示2
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            if(vmTabvendor.type == 'OPENSTACK'){
                $scope.openstackNetworkTable = 1;
            }else if(vmTabvendor.type == 'JDYUN'||vmTabvendor.type == 'ALIYUN'||vmTabvendor.type == 'VMWARE'){
                $scope.otherNetworkTable = 1;
            }
            //新增
            $scope.add = function($event,size){
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/network/add.html',
                    controller : 'addNetworkModalCtrl'
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //新增子网
            $scope.add1 = function($event,networkId,size){
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/subnet/add.html',
                    controller : 'addSubnetModalCtrl',
                    resolve : {
                        networkId : function(){
                            return networkId;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //删除
            $scope.remove = function($event,id){
                if($event) $event.stopPropagation();
                $scope.removeData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/network/remove.html',
                    controller : 'removeNetworkModalCtrl',
                    resolve : {
                        removeData : function(){
                            return $scope.removeData;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //同步
            $scope.sync = function($event){
                var action = 6;
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/vm/sync.html',
                    controller : 'msyncVmModalCtrl',
                    resolve : {
                        action : function(){
                            return action;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //跳转详情页
            $scope.detail = function(id){
                $state.go('app.assets.networkDetail',{vmId:id,id:$stateParams.id});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addNetworkModalCtrl',['$scope','$modalInstance','httpLoad','$stateParams',
        function($scope,$modalInstance,httpLoad,$stateParams){ //依赖于modalInstance
            $scope.addData = {};
            //获取可用区域数据
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
                                }
                                else data.isRegionActive = false;
                            });
                        }
                    }
                });
            };
            $scope.getRegion();

            //选择可用区域
            $scope.chooseRegion = function(item){
                angular.forEach($scope.regionData, function(data,index){
                    data.isRegionActive = false;
                    if(data.id==item.id){
                        data.isRegionActive = !item.isRegionActive;
                    }
                    if(data.isRegionActive){
                        $scope.addData.region = data.id;
                    }
                });
            };
            $scope.ok = function(){
                $scope.addData.id = $stateParams.id;
                if(!$scope.addData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                httpLoad.loadData({
                    url:'/network/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('网络新增成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    //删除ctrl
    angular.module('app').controller('removeNetworkModalCtrl',['$scope','$modalInstance','httpLoad','removeData',
        function($scope,$modalInstance,httpLoad,removeData){ //依赖于modalInstance
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/network/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('网络删除成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    app.controller('securityCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 安全组管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));

            //获取安全组列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [{"param":{"vendorId":vmTabvendor.id},"sign":"EQ"}];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/security/group/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.securityList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            //京东云和阿里云显示1
            if(vmTabvendor.type == 'JDYUN'||vmTabvendor.type == 'ALIYUN'){
                $scope.securityTable = 1;
            }
            //如果Tab是当前页
            var vmtabLocation = JSON.parse(sessionStorage.getItem('vmtabLocation'));
            if(vmtabLocation.indexOf("security")>=0) $scope.getData(1);

            //返回
            $scope.goBack = function(){
                $scope.isActive = false;
                $timeout(function() {
                    $scope.showDetail = false;
                }, 200);
            };
            //跳转详情页
            $scope.detail = function(id,$event){
                $state.go('app.assets.securityDetail',{vmId:id,id:$stateParams.id});
            };
            //同步
            $scope.sync = function($event){
                var action = 7;
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/vm/sync.html',
                    controller : 'msyncVmModalCtrl',
                    resolve : {
                        action : function(){
                            return action;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //新增
            $scope.add = function($event){
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/security/add.html',
                    controller : 'addSecurityModalCtrl'
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //删除
            $scope.remove = function($event,id){
                if($event) $event.stopPropagation();
                $scope.removeData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/security/remove.html',
                    controller : 'removeSecurityModalCtrl',
                    resolve : {
                        removeData : function(){
                            return $scope.removeData;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addSecurityModalCtrl',['$rootScope','$scope','$modalInstance','httpLoad','$stateParams',
        function($rootScope,$scope,$modalInstance,httpLoad,$stateParams){ //依赖于modalInstance
            $scope.addData = {};
            //获取可用区域数据
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
                                }
                                else data.isRegionActive = false;
                            });
                        }
                    }
                });
            };
            $scope.getRegion();

            //选择可用区域
            $scope.chooseRegion = function(item){
                angular.forEach($scope.regionData, function(data,index){
                    data.isRegionActive = false;
                    if(data.id==item.id){
                        data.isRegionActive = !item.isRegionActive;
                    }
                    if(data.isRegionActive){
                        $scope.addData.region = data.id;
                    }
                });
            };
            $scope.ok = function(){
                $scope.addData.id = $stateParams.id;
                if(!$scope.addData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                httpLoad.loadData({
                    url:'/security/group/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('安全组新增成功');
                            $modalInstance.close();
                        }
                    }
                });

            };

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    //删除ctrl
    angular.module('app').controller('removeSecurityModalCtrl',['$scope','$modalInstance','httpLoad','removeData',
        function($scope,$modalInstance,httpLoad,removeData){ //依赖于modalInstance
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/security/group/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('安全组删除成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    app.controller('subnetCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 子网管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            //获取列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
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
            //如果Tab是当前页
            var vmtabLocation = JSON.parse(sessionStorage.getItem('vmtabLocation'));
            if(vmtabLocation.indexOf("subnet")>=0) $scope.getData(1);
            //openstack显示1
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            if(vmTabvendor.type == 'OPENSTACK'){
                $scope.openstackNetworkTable = 1;
            }
            //新增
            $scope.add = function($event,size){
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/subnet/add.html',
                    controller : 'addSubnetModalCtrl'
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //删除
            $scope.remove = function($event,id){
                if($event) $event.stopPropagation();
                $scope.removeData= {"id" : id};
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/subnet/remove.html',
                    controller : 'removeSubnetModalCtrl',
                    resolve : {
                        removeData : function(){
                            return $scope.removeData;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //跳转详情页
            $scope.detail = function(id){
                $state.go('app.assets.subnetDetail',{vmId:id,id:$stateParams.id});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addSubnetModalCtrl',['$scope','$modalInstance','httpLoad','$stateParams','networkId',
        function($scope,$modalInstance,httpLoad,$stateParams,networkId){ //依赖于modalInstance
            $scope.addData = {};$scope.addData.networkId = networkId;
            //获取可用区域数据
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
                                }
                                else data.isRegionActive = false;
                            });
                        }
                    }
                });
            };
            $scope.getRegion();
            //选择可用区域
            $scope.chooseRegion = function(item){
                angular.forEach($scope.regionData, function(data,index){
                    data.isRegionActive = false;
                    if(data.id==item.id){
                        data.isRegionActive = !item.isRegionActive;
                    }
                    if(data.isRegionActive){
                        $scope.addData.region = data.id;
                    }
                });
            };
            $scope.ok = function(){
                $scope.addData.id = $stateParams.id;
                if(!$scope.addData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                httpLoad.loadData({
                    url:'/subnet/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('子网新增成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    app.controller('bucketCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 子网管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            $scope.aclData = [{"name":"公有","value":true},{"name":"私有","value":false}];
            //获取bucket列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [{"param":{"vendorId":$stateParams.id},"sign":"EQ"}];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                if($scope.searchByAcl&&$scope.searchByAcl!=""){
                    for(var i=0;i<searchParam.length;i++){
                        if(searchParam[i].sign=="EQ") {
                            searchParam[i].param.acl = $scope.searchByAcl;
                        }
                    }
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/bucket/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.bucketList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            //如果Tab是当前页
            var vmtabLocation = JSON.parse(sessionStorage.getItem('vmtabLocation'));
            if(vmtabLocation.indexOf("bucket")>=0) $scope.getData(1);
            //aliyun显示1
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            if(vmTabvendor.type == 'ALIYUN'){
                $scope.bucketTable = 1;
            }
            //返回
            $scope.goBack = function(){
                $scope.isActive = false;
                $timeout(function() {
                    $scope.showDetail = false;
                }, 200);
            };
            //跳转详情页
            $scope.detail = function(id,$event){
                //$event.stopPropagation();
                $state.go('app.assets.bucketDetail',{bucketId:id,id:$stateParams.id});
            };
            //新增
            $scope.add = function ($event) {  //打开模态
                $event.stopPropagation();
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/assets/storage/bucket/add.html',  //指向上面创建的视图
                    controller: 'addBucketModalCtrl',// 初始化模态范围
                    size: 'lg' //大小配置
                });
                modalInstance.result.then(function (result) {
                    $scope.getData();
                });
            };
            //删除
            $scope.remove = function($event,id){
                if($event) $event.stopPropagation();
                $scope.removeData= {"id" : id};
                var actionTxt = '是否删除对象存储?';
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/storage/remove.html',
                    controller : 'removeBucketModalCtrl',
                    resolve : {
                        actionTxt : function(){
                            return actionTxt;
                        },
                        removeData : function(){
                            return $scope.removeData;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
            //同步
            $scope.sync = function($event){
                var action = 8;
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/assets/storage/sync.html',
                    controller : 'msyncVmModalCtrl',
                    resolve : {
                        action : function(){
                            return action;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                },function(){});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addBucketModalCtrl',['$rootScope','$scope','$modalInstance','httpLoad','$stateParams',
        function($rootScope,$scope,$modalInstance,httpLoad,$stateParams){ //依赖于modalInstance
            $scope.addData = {};
            $scope.aclData = [{"name":"公有","value":true},{"name":"私有","value":false}];
            $scope.addData.acl = true;
            var storageTabvendorId = JSON.parse(sessionStorage.getItem('storageTabvendorId'));
            //获取可用区域数据
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
                                }
                                else data.isRegionActive = false;
                            });
                        }
                    }
                });
            };
            $scope.getRegion();

            //选择可用区域
            $scope.chooseRegion = function(item){
                angular.forEach($scope.regionData, function(data,index){
                    data.isRegionActive = false;
                    if(data.id==item.id){
                        data.isRegionActive = !item.isRegionActive;
                    }
                    if(data.isRegionActive){
                        $scope.addData.region = data.id;
                    }
                });
            };
            $scope.ok = function(){
                $scope.addData.id = $stateParams.id;
                if(!$scope.addData.region){
                    $scope.pop('请选择可用区域','error');
                    return;
                }
                if(!$scope.addData.acl){
                    $scope.pop('请选择权限','error');
                    return;
                }
                httpLoad.loadData({
                    url:'/bucket/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('对象存储新增成功');
                            $modalInstance.close();
                        }
                    }
                });

            };

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    //删除ctrl
    angular.module('app').controller('removeBucketModalCtrl',['$scope','$modalInstance','httpLoad','removeData','actionTxt',
        function($scope,$modalInstance,httpLoad,removeData,actionTxt){
            $scope.actionTxt = actionTxt;
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/bucket/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('对象存储删除成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
        }]);
    app.controller('vmTemplateCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','$stateParams',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,$stateParams) {
            //$rootScope.moduleTitle = '资源中心 > 平台管理';//定义当前页
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            //获取云主机列表
            $scope.getData = function(page){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [{"param":{"vendorId":vmTabvendor.id,"isTemplate":true},"sign":"EQ"}];
                if($scope.searchByName&&$scope.searchByName!=""){
                    searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                }
                if($scope.searchByStatus&&$scope.searchByStatus!=""){
                    var a = 0;
                    for(var i=0;i<searchParam.length;i++){
                        if(searchParam[i].sign=="LK") {
                            a = 1;
                            searchParam[i].param.status = $scope.searchByStatus;
                        }
                    }
                    if(a==0) searchParam.push({"param":{"status":$scope.searchByStatus},"sign":"LK"});
                }
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/vm/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.vmList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                            angular.forEach($scope.vmList, function(data,index){
                                //状态
                                data.isShowRecover = data.isRecover = data.isShowPaused = data.isPaused = data.isShowSuspended = data.isSuspended = data.isShowActive = data.isActive = data.isShowStart = data.isStart = data.isShowStop = data.isStop = false;
                                switch(data.status){
                                    case 'RUNNING':
                                        data.isShowStop = true;data.isStop = false;
                                        data.isShowRestart = true;data.isRestart = false;
                                        data.isShowStart = false;
                                        data.isShowPaused = true;data.isPaused = false;
                                        data.isShowSuspended = true;data.isSuspended = false;
                                        data.statusColor = 'success';
                                        break;
                                    case 'STOPPED':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = false;
                                        data.isShowRecover = true;data.isRecover = false;
                                        data.isShowActive = true;data.isActive = false;
                                        data.statusColor = 'warning';
                                        break;
                                    case 'STOPPING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = true;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'STARTING':
                                        data.isShowStop = true;data.isStop = true;
                                        data.isShowRestart = true;data.isRestart = false;
                                        data.isShowStart = false;
                                        data.isShowPaused = true;data.isPaused = true;
                                        data.isShowSuspended = true;data.isSuspended = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'SUSPENDED':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowActive = true;data.isActive = false;
                                        data.statusColor = 'primary';
                                        break;
                                    case 'SUSPENDING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'ACTIVING':
                                        data.isShowStop = true;data.isStop = true;
                                        data.isShowRestart = true;data.isRestart = false;
                                        data.isShowStart = false;
                                        data.isShowPaused = true;data.isPaused = true;
                                        data.isShowSuspended = true;data.isSuspended = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'PAUSED':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowRecover = true;data.isRecover = false;
                                        data.statusColor = 'warning';
                                        break;
                                    case 'PAUSING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'RECOVERING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowPaused = true;data.isPaused = true;
                                        data.isShowSuspended = true;data.isSuspended = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'PAUSING':
                                        data.isShowStop = true;data.isStop = true;
                                        data.isShowRestart = true;data.isRestart = false;
                                        data.isShowStart = false;
                                        data.statusColor = 'default';
                                        break;
                                    case 'BUILDING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = true;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'RESTARTING':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = false;
                                        data.isShowPaused = true;data.isPaused = true;
                                        data.isShowSuspended = true;data.isSuspended = true;
                                        data.statusColor = 'default';
                                        break;
                                    case 'EXPIRED':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = true;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'default';
                                    case 'EXCEPTION':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = true;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'danger';
                                        break;
                                    case 'SYNSEXCEPTION':
                                        data.isShowStop = false;
                                        data.isShowRestart = true;data.isRestart = true;
                                        data.isShowStart = true;data.isStart = true;
                                        data.isShowRecover = true;data.isRecover = true;
                                        data.isShowActive = true;data.isActive = true;
                                        data.statusColor = 'danger';
                                        break;
                                }
                            });
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            //openstack显示1,
            var vmTabvendor = JSON.parse(sessionStorage.getItem('vmTabvendor'));
            if(vmTabvendor.type == 'VMWARE'){
                $scope.vmTemplateTable = 1;
            }
            //如果Tab是当前页
            var vmtabLocation = JSON.parse(sessionStorage.getItem('vmtabLocation'));
            if(vmtabLocation.indexOf("vmTemplateDetail")>=0) $scope.getData(1);
            //状态数据
            $scope.statusData = [{"value":"RUNNING","name":"运行中"},{"value":"STOPPED","name":"关机"},{"value":"SUSPENDED","name":"挂起"},{"value":"PAUSED","name":"停止"},{"value":"EXCEPTION","name":"异常"}];
            //返回
            $scope.goBack = function(){
                $scope.isActive = false;
                $timeout(function() {
                    $scope.showDetail = false;
                }, 200);
            };
            //跳转详情页
            $scope.detail = function(id,$event){
                //$event.stopPropagation();
                $state.go('app.assets.vmTemplateDetail',{vmId:id,id:$stateParams.id});
            };
        }
    ]);
})();
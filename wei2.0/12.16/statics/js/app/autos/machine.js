/**
 * Created by wangwenya on 2016/10/27.
 */
(function(){
    "use strict";
    app.controller('MachineListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE','CommonData',
        function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE, CommonData) {
            $rootScope.moduleTitle = '自动装机 > 裸机管理 ';//定义当前页
            $scope.levelData = CommonData.alarmLevel;
            $scope.param = {
                page: 1,
                rows: 10,
            };

            $scope.getList = function(page){
                $scope.param.page = page || $scope.param.page;
                httpLoad.loadData({
                    url:'/statics/api/autos/machine/machine-list.json',
                    method:'GET',
                    noParam: true,
                    data:$scope.param,
                    success:function(data){
                        if(data.success){
                            $scope.listData = data.data.rows;
                            $scope.totalPage = data.data.total;
                        }
                    }
                });
            }
            $scope.getList();
            //对参数进行处理，去除空参数
            var toObjFormat = function(obj) {
                for (var a in obj) {
                    if (obj[a] == "") delete obj[a];
                }
                return obj;
            };

            //搜索
            $scope.search = function(){
                // //对时间进行处理
                // var toFormatTime = function(time, place) {
                // 	if (!time) return "";
                // 	var date = time.split(' - ');
                // 	return date[place/1];
                // }
                var params = [];
                var param1 = toObjFormat({
                    name:$scope.name,
                });
                var param2 = toObjFormat({
                    level: $scope.level,
                    appId: $scope.appId,
                    dsId: $scope.dsId
                });
                if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
                if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
                $scope.param = {
                    page: 1,
                    rows: 10,
                    params: angular.toJson(params)
                }
                $scope.getList(1)
            }
            //重置搜索条件
            $scope.reset = function(){
                var obj = ['name','level','appId','dsId'];
                angular.forEach(obj,function(data){
                    $scope[data] = '';
                })
            }
            //添加\编辑
            $scope.create = function(id){
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/alarm/alarm/addModal.html',
                    controller: 'addAlarmModalCtrl',
                    backdrop: 'static',
                    resolve: {
                        id: function() {
                            return id || '';
                        },
                        appData: function() {
                            return $scope.appData;
                        },
                        dsData: function() {
                            return $scope.dsData;
                        }
                    }
                });
                modalInstance.result.then(function(data) {
                    $scope.getList();
                });
            }
            //删除告警策略
            $scope.remove = function(id){
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/operation/newtask/delModal.html',
                    controller: 'delModalCtrl',
                    backdrop: 'static',
                    resolve:{
                        tip: function () {
                            return '你要确认该警告策略吗？';
                        },
                        btnList: function () {
                            return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
                        }
                    }
                });
                modalInstance.result.then(function() {
                    httpLoad.loadData({
                        url: '/alarm/strategy/remove',
                        data: {id:id},
                        success: function(data){
                            if(data.success){
                                $scope.pop(LANGUAGE.ALARM.ALARM.DEL_SUCCESS);
                                $scope.getList();
                            }
                        }
                    });
                });
            };
            //详情
            $scope.goDetail = function(id){
                $state.go('app.autos.machinedetail',{id:id})
            };



            //详情
            $scope.install = function(id){
                var selectArr = [];
            for(var i=0;i<$scope.listData.length;i++){
                var item = $scope.listData[i];
                if(item.isSelected==true){
                    selectArr.push({id:item.id,name:item.name})
                }
            }
                if(selectArr.length==0){
                    $scope.pop('必须选择主机才能安装','error');
                    return false
                }
                localStorage.setItem('hosts',angular.toJson(selectArr));
                $state.go('app.autos.machineinstall')
            }

            //全选
            $scope.selectAll = function(){
                for(var a in $scope.listData){
                    var item = $scope.listData[a];
                    if($scope.isSelectAll != item.isSelected){
                        item.isSelected = $scope.isSelectAll;

                    }else item.isSelected = $scope.isSelectAll;
                }
            };
            //选择一个
            $scope.selectItem = function ($event,row) {
                $event.stopPropagation();
                $event.preventDefault();
                row.isSelected = !row.isSelected;

            }
        }
    ]);
//添加\编辑
    app.controller('addAlarmModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id', 'LANGUAGE','CommonData','appData','dsData',
        function($scope, $modalInstance,  httpLoad, id, LANGUAGE, CommonData,appData,dsData) {
            $scope.modalName = '添加告警策略';
            $scope.appData = appData;
            $scope.dsData = dsData;
            $scope.levelData = CommonData.alarmLevel;
            var editObj = ['name','level','measurement','appId','dsId','remark'];
            var url = '/alarm/strategy/create';
            (function(){
                httpLoad.loadData({
                    url: '/statics/api/alarm/measurementData.json',
                    method:'GET',
                    noParam: true,
                    data: {
                        simple:true
                    },
                    success: function(data){
                        if(data.success){
                            $scope.measurementData = data.data;
                        }
                    }
                });
            })();
            //如果为编辑，进行赋值
            if(id){
                url = '/alarm/strategy/modify';
                $scope.modalName = '编辑告警策略';
                httpLoad.loadData({
                    url: '/alarm/strategy/detail',
                    method: 'GET',
                    data: {id: id},
                    success: function(data){
                        if(data.success){
                            var data = data.data;
                            for(var a in editObj){
                                var attr = editObj[a];
                                $scope[attr] = data[attr];
                            };
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
                            var popText = LANGUAGE.ALARM.ALARM.ADD_SUCCESS;
                            if(id) popText = LANGUAGE.ALARM.ALARM.EDIT_SUCCESS;
                            $scope.pop(popText);
                            $modalInstance.close(data);
                        }
                    }
                });
            }
            $scope.cancle = function() {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
})()
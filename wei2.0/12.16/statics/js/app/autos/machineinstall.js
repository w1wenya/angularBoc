/**
 * Created by wangwenya on 2016/10/27.
 */
(function(){
    "use strict";
    app.controller('MachineInstallCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE','CommonData',
        function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE, CommonData) {
            $rootScope.link = '/statics/css/autos.css'
            $rootScope.moduleTitle = '自动装机 > 裸机管理 > 安装 ';//定义当前页
            $scope.levelData = CommonData.alarmLevel;
            $scope.param = {
                page: 1,
                rows: 10,
            };
            $scope.selectArr = angular.fromJson(localStorage.getItem('hosts'));
            $scope.showWizardtype =1;
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
            //详情
            $scope.flag_install = function(flag){
               if(flag==0){
                   if( $scope.showWizardtype==1){
                       $scope.showWizardtype =1;
                   }else{
                       $scope.showWizardtype =  $scope.showWizardtype-1
                   }
               }
                if(flag == 1){
                    if( $scope.showWizardtype==4){
                        $scope.showWizardtype =4;
                    }else{
                        $scope.showWizardtype =  $scope.showWizardtype+1
                    }
                }
            }
            //改变raid
            $scope.changeRaid = function(name){
                for(var i=0;i<$scope.listData.length;i++){
                    var item = $scope.listData[i];
                    if(item.isSelected==true){
                        item.raid = name;
                    }
                }
            }
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

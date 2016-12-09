(function(){
    "use strict";
    app.controller('groupManageScriptCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','LANGUAGE',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,LANGUAGE) {
            $rootScope.moduleTitle = '配置中心 > 脚本分组管理';//定义当前页
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            $scope.isbatchDelete = true;
            //获取脚本分组列表
            $scope.getData = function(param){
                param = param||{'parentId':0};
                httpLoad.loadData({
                    url: '/script/group/list',
                    method: 'POST',
                    data: param,
                    noParam:true,
                    success: function(data){
                        if(data.success){
                            $scope.treeData = data.data;
                            //$('#dg').treegrid('loadData',$scope.treeData);
                            $scope.isLoad = true;
                        }else{
                            $scope.isLoad = false;
                        }
                    }
                });
            };
            $scope.getData();

            //获取用户类型数据
            /*httpLoad.loadData({
             url:'/dict/children',
             method:'POST',
             data:{value :"STATUS_CATEGORY"},
             success:function(data){
             $scope.permissionState = data.data;
             }
             });*/
            //添加/编辑
            $scope.add = function(flag,item,$event){
                if($event) $event.stopPropagation();
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/config/groupManageScript/add.html',
                    controller: 'addGroupManageScriptModalCtrl',
                    backdrop: 'static',
                    resolve: {
                        flag: function(){
                            return flag;
                        },
                        itemData: function() {
                            return item;
                        }
                    }
                });
                modalInstance.result.then(function(data) {
                    if(flag == 2) {
                        $scope.getData();
                    } else{
                        $scope.getData();
                    }
                });
            };
            //删除
            $scope.remove = function (item,$event){
                if($event) $event.stopPropagation();
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/config/groupManageScript/remove.html',
                    controller: 'delGroupManageScriptModalCtrl',
                    backdrop: 'static',
                    resolve: {
                        id: function() {
                            return  item.id;
                        }
                    }
                });
                modalInstance.result.then(function() {
                    $scope.getData();
                });
            };
            //返回
            $scope.goBack = function(){
                $scope.isActive = false;
                $timeout(function() {
                    $scope.showDetail = false;
                }, 200);
            };
            //跳转详情页
            $scope.detail = function(item,$event){
                $state.go('app.config.groupManageScriptDetail',{id:item.id});
            };
        }
    ]);
    //添加/编辑ctrl
    angular.module('app').controller('addGroupManageScriptModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'flag', 'itemData',
        function($scope, $modalInstance,  httpLoad, flag, itemData) {
            //编辑对象
            var editObj = ['id','name','code','remark'];
            $scope.modalName = '添加脚本分组';
            var url = '/script/group/create';
            //如果为编辑，进行赋值
            if(flag == 2){
                url = '/script/group/modify';
                $scope.modalName = '编辑脚本分组';
                for(var a in editObj){
                    var attr = editObj[a];
                    $scope[attr] = itemData[attr];
                }
            }
            //保存按钮
            $scope.ok = function(){
                var param = {};
                for(var a in editObj){
                    var attr = editObj[a];
                    param[attr] = $scope[attr];
                }
                if(flag == 2) param.id = itemData.id;
                else param.parentId = itemData.id || 0;
                httpLoad.loadData({
                    method: 'POST',
                    url: url,
                    data: param,
                    success: function(data){
                        if(data.success){
                            console.log(param);
                            var popText = '脚本分组添加成功';
                            if(flag == 2) popText = '脚本分组修改成功';
                            $scope.pop(popText);
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
    //删除机房ctrl
    angular.module('app').controller('delGroupManageScriptModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
        function($scope, $modalInstance, httpLoad, id) {
            $scope.ok = function(){
                httpLoad.loadData({
                    url: '/script/group/remove',
                    data: {id: id},
                    success: function(data){
                        if(data.success){
                            $scope.pop("脚本分组删除成功");
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
})();


angular.module('app').directive('groupscriptGrid', ['$rootScope', '$timeout', 'httpLoad',
    function ($rootScope,$timeout,httpLoad) {
        return {
            restrict: 'AEC',
            transclude: true,
            scope : {
                treeData        : '=',
                getData    : '&',
                add     : '&',
                remove     : '&',
                detail     : '&'
            },
            link: function (scope, element, attrs) {
                scope.$watch('treeData',function(newValue,oldValue){
                    element.treegrid({
                        data: scope.treeData,
                        dataType:'json',
                        idField:'id',
                        treeField:'name',
                        animate: true,
                        fitColumns:true,
                        onBeforeExpand: function(row,param){
                            if(row&&row.children1){
                                httpLoad.loadData({
                                    url: '/script/group/list',
                                    method: 'POST',
                                    data: {"parentId":row.id},
                                    noParam:true,
                                    success: function(data){
                                        if(data.success){
                                            if (row.children1){
                                                $('#dg').treegrid('append',{
                                                    parent: row.id,
                                                    data: data.data
                                                });
                                                row.children1 = undefined;
                                                $('#dg').treegrid('collapse', row.id);
                                                $('#dg').treegrid('expand', row.id);
                                            }
                                            return row.children1 == undefined;
                                        }
                                    },
                                    error: function (XMLHttpRequest, textStatus, errorThrown) {}
                                });
                            }
                            //return true;
                        },
                        columns:[[
                            {field:'name',title:'分组名称',width:'30%',align:'left'},
                            {field:"status",title:'分组状态',width:'15%',align:'center'},
                            {field:'code',title:'编码',width:'20%',align:'center'},
                            {field:'operate',title:'操作',width:'35%',align:'center',
                                formatter: function(value,row,index){
                                    row.parentId = row.parentId || 0;
                                    var id=row.id,
                                        parentId=row.parentId,
                                        name=row.name,
                                        code=row.code,
                                        remark=row.remark||"";
                                    var html='';
                                    html+='<button class="btn btn-primary btn-sm addName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" code="'+code+'" remark="'+remark+'"><i class="fa fa-plus-circle icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">新增</span></button>'+ '&nbsp;&nbsp;';//默认只有二级节点
                                    html+='<button class="btn btn-success btn-sm updateName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" code="'+code+'" remark="'+remark+'"><i class="fa fa-pencil-square-o icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">编辑</span></button>'+ '&nbsp;&nbsp;';
                                    html+='<button class="btn btn-danger btn-sm deleteName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" code="'+code+'" remark="'+remark+'"><i class="fa fa-trash-o icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">删除</span></button>'+ '&nbsp;&nbsp;';
                                    html+='<button class="btn btn-info btn-sm detailName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" code="'+code+'" remark="'+remark+'"><i class="fa fa-info-circle icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">详情</span></button>';

                                    return html;
                                }
                            }
                        ]],
                        onLoadSuccess: function(row, data){
                            $(".datagrid-body").on('click','button.addName',function($event){
                                $event.stopPropagation();
                                var _this =$(this);
                                flag= 1;
                                item = {
                                    id :  _this.attr("id"),
                                    parentId : _this.attr("parentId"),
                                    name :  _this.attr("name"),
                                    code :  _this.attr("code"),
                                    remark :  _this.attr("remark")
                                };
                                scope.add({flag:flag,item:item});
                            });
                            $(".datagrid-body").on('click','button.updateName',function($event){
                                $event.stopPropagation();
                                var _this =$(this);
                                flag= 2;
                                item = {
                                    id :  _this.attr("id"),
                                    parentId : _this.attr("parentId"),
                                    name :  _this.attr("name"),
                                    code :  _this.attr("code"),
                                    remark :  _this.attr("remark")
                                };
                                scope.add({flag:flag,item:item});
                            });
                            $(".datagrid-body").on('click','button.deleteName',function($event){
                                $event.stopPropagation();
                                var _this =$(this);
                                item = {
                                    id : _this.attr("id")
                                };
                                scope.remove({item:item});
                            });
                            $(".datagrid-body").on('click','button.detailName',function($event){
                                $event.stopPropagation();
                                var _this =$(this);
                                item = {
                                    id : _this.attr("id")
                                };
                                scope.detail({item:item});
                            });
                        },
                        loadFilter: function(data,parentId){
                            function setData(){
                                var todo = [];
                                for(var i=0; i<data.length; i++){
                                    if(data[i].status=="NORMAL") data[i].status = "正常";
                                    if(data[i].status=="ABNORMAL") data[i].status = "异常";
                                    todo.push(data[i]);
                                }
                                while(todo.length){
                                    var node = todo.shift();
                                    if (node.children){
                                        node.state = 'closed';
                                        node.children1 = node.children;
                                        node.children = undefined;
                                        todo = todo.concat(node.children1);
                                    }
                                }
                            }
                            setData(data);
                            return data;
                        }
                    });
                });
            }
        };
}]);
/*ngular.module('app').controller('dictionaryCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', '$timeout', function($rootScope, $scope, httpLoad, $modal, $timeout) {
    $rootScope.link = '/statics/css/user.css';
    $rootScope.moduleTitle = '配置中心 > 系统字典';
    $scope.param = {};

    $scope.getDataList = function(){
        var  searchParam = [],noParam = false;
        if($scope.searchByName&&$scope.searchByName!=""){
            searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
        }
        if(searchParam.length==0){
            noParam = true;
        }else{
            $scope.param.params = JSON.stringify(searchParam);
        }
        httpLoad.loadData({
            url: '/dict/tree',
            method: 'GET',
            data: $scope.param,
            noParam:noParam,
            success: function(data){
                if(data.success){
                    //console.log($scope.param);
                    $scope.tree_data = getTree(data.data, 'id', 'pvalue');
                    $scope.isLoad = true;
                    $timeout(function(){
                        $scope.my_tree.expand_all();
                    },100)
                }
            }
        });
    };
    $scope.getDataList();
    $scope.expanding_property = {
        field: "name",
        displayName: "名称"
    };
    $scope.my_tree = tree = {};
    //$scope.actionData = [{name:'添加',flag:1},{name:'修改',flag:2},{name:'删除',flag:3}];
    $scope.col_defs = [
        {
            field: "value",
            displayName: "内容"
        }
    ];
    //$scope.my_tree_handler = function (branch) {
    //	console.log('you clicked on', branch)
    //}
    //对数据进行处理
    var getTree = function(data, primaryIdName, parentIdName) {
        if (!data || data.length == 0 || !primaryIdName || !parentIdName)
            return [];

        var tree = [],
            rootIds = [],
            item = data[0],
            primaryKey = item[primaryIdName],
            treeObjs = {},
            parentId,
            parent,
            len = data.length,
            i = 0;

        while (i < len) {
            item = data[i++];
            primaryKey = item[primaryIdName];
            treeObjs[primaryKey] = item;
            parentId = item[parentIdName];

            if (parentId) {
                parent = treeObjs[parentId];

                if (parent.children) {
                    parent.children.push(item);
                } else {
                    parent.children = [item];
                }
            } else {
                rootIds.push(primaryKey);
            }
        }

        for (var i = 0; i < rootIds.length; i++) {
            tree.push(treeObjs[rootIds[i]]);
        };

        return tree;
    }
}]);*/


(function(){
    "use strict";
    app.controller('dictionaryCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '配置中心 > 字典管理';//定义当前页
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            $scope.isbatchDelete = true;
            //获取字典列表
            $scope.getData = function(param){
                param = param||{'value':''};
                httpLoad.loadData({
                    url: '/dict/list',
                    method: 'POST',
                    data: param,
                    noParam:true,
                    success: function(data){
                        if(data.success && data.data && data.data.length!=0){
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
            //添加/编辑
            /*$scope.add = function(flag,item,$event){
                if($event) $event.stopPropagation();
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/config/dictionary/add.html',
                    controller: 'addDictionaryModalCtrl',
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
            };*/
            //删除
            /*$scope.remove = function (item,$event){
                if($event) $event.stopPropagation();
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/config/dictionary/remove.html',
                    controller: 'delDictionaryModalCtrl',
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
            };*/
        }
    ]);
    //添加/编辑ctrl
    /*angular.module('app').controller('addDictionaryModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'flag', 'itemData',
        function($scope, $modalInstance,  httpLoad, flag, itemData) {
            //编辑对象
            var editObj = ['id','name','value'];
            $scope.modalName = '添加词条';
            var url = '/dictionary/create';
            //如果为编辑，进行赋值
            if(flag == 2){
                url = '/dictionary/modify';
                $scope.modalName = '编辑词条';
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
                            var popText = '词条添加成功';
                            if(flag == 2) popText = '词条修改成功';
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
    ]);*/
    //删除机房ctrl
    /*angular.module('app').controller('delDictionaryModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
        function($scope, $modalInstance, httpLoad, id) {
            $scope.ok = function(){
                httpLoad.loadData({
                    url: '/dictionary/remove',
                    data: {id: id},
                    success: function(data){
                        if(data.success){
                            $scope.pop("词条删除成功");
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            };
        }
    ]);*/
})();

angular.module('app').directive('dictionaryGrid', ['$rootScope', '$timeout', 'httpLoad',
    function ($rootScope,$timeout,httpLoad) {
        return {
            restrict: 'AEC',
            transclude: true,
            scope : {
                treeData        : '=',
                getData    : '&',
                add     : '&',
                remove     : '&'
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
                            //$(this).treegrid('options').url = '/dictionary/list?parentId='+row.id;
                            if(row){
                                httpLoad.loadData({
                                    url: '/dict/list',
                                    method: 'POST',
                                    data: {"value":row.value},
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
                            //return false;
                        },
                        columns:[[
                            {field:'name',title:'名称',width:'50%',align:'left'},
                            {field:'value',title:'内容',width:'50%',align:'left'},
                            /*{field:'operate',title:'操作',width:'30%',align:'center',
                                formatter: function(value,row,index){
                                    row.parentId = row.parentId || 0;
                                    var id=row.id,
                                        parentId=row.parentId,
                                        name=row.name,
                                        value=row.value||"";
                                    var html='';
                                    //html+='<button class="btn btn-default addName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" value="'+value+'"><i class="fa fa-plus-circle icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">新增</span></button>'+ '&nbsp;&nbsp;';//默认只有二级节点
                                    //html+='<button class="btn btn-default updateName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" value="'+value+'"><i class="fa fa-pencil-square-o icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">编辑</span></button>'+ '&nbsp;&nbsp;';
                                    //html+='<button class="btn btn-default deleteName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" value="'+value+'"><i class="fa fa-trash-o icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">删除</span></button>';
                                    return html;
                                }
                            }*/
                        ]],
                        onLoadSuccess: function(row, data){
                            $(".datagrid-body").on('click','button.addName',function($event){
                                $event.stopPropagation();
                                var _this =$(this);
                                flag= 1;
                                item = {
                                    id :  _this.attr("id"),
                                    pvalue : _this.attr("pvalue"),
                                    name :  _this.attr("name"),
                                    value :  _this.attr("value")
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
                                    value :  _this.attr("value")
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
                        },
                        loadFilter: function(data,parentId){
                            //if(data.data&&data.success) data = data.data;
                            function setData(){
                                var todo = [];
                                for(var i=0; i<data.length; i++){
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

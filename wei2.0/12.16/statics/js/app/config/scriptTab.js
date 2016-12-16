(function(){
    app.controller('scriptTabCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '参数管理 > 分组管理';//定义当前页
            $rootScope.link = '/statics/css/managescript.css';
            if(sessionStorage.getItem('scripttabLocation')!=null){
                var scripttabLocation = JSON.parse(sessionStorage.getItem('scripttabLocation'));
                if(!scripttabLocation){
                    $scope.active1 = true;
                } else{
                    if(scripttabLocation.indexOf("script")>=0) $scope.active1 = true;
                    else $scope.active2 = true;
                }
            }else{
                $scope.active1 = true;$scope.active2 = false;
            }
        }
    ]);
    app.controller('ScriptManageCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            //$rootScope.moduleTitle = '系统管理 > 分组管理';
            //$rootScope.link = '/statics/css/user.css';//引入页面样式
            //获取脚本列表数据
            $scope.param = {
                page: 1,
                rows: 10
            };
            $scope.index = 0;

            $scope.getScriptList = function(page){
                $scope.param.page = page || $scope.param.page;
                httpLoad.loadData({
                    url:'/script/list',
                    method:'POST',
                    noParam:true,
                    data:$scope.param,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.scriptListData = data.data.rows;
                            $scope.totalPage = data.data.total;
                            $scope.isImageData = false;
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                })
            };
            if(sessionStorage.getItem('scripttabLocation')!=null){
                var scripttabLocation = JSON.parse(sessionStorage.getItem('scripttabLocation'));
                if(scripttabLocation.indexOf("script")>=0) $scope.getScriptList();
            }else{
                $scope.getScriptList();
            }

            //对参数进行处理，去除空参数
            var toObjFormat = function(obj) {
                for (var a in obj) {
                    if (obj[a] == "") delete obj[a];
                }
                return obj;
            };
            //搜索
            $scope.search = function(){
                var sValues = $("#mycombotree0").combotree("getValues");
                //对时间进行处理
                var toFormatTime = function(time, place) {
                    if (!time) return "";
                    var date = time.split(' - ');
                    return date[place/1];
                };
                var params = [];
                var param1 = toObjFormat({
                    name:$scope.name
                });
                var param2 = toObjFormat({
                    groupId:sValues[0]
                });
                if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
                if (param2.groupId != ""&&param2.groupId) params.push({param: param2, sign: 'EQ'});
                if ($scope.date) {
                    params.push({param: {gmtCreate: toFormatTime($scope.date, 0)}, sign: 'GET'});
                    params.push({param: {gmtCreate: toFormatTime($scope.date, 1)}, sign: 'LET'});
                }
                $scope.param = {
                    page: 1,
                    rows: 10,
                    params: angular.toJson(params)
                };
                $scope.getScriptList();
            };
            //重置搜索条件
            $scope.reset = function(){
                var obj = ['name','date'];
                angular.forEach(obj,function(data){
                    $scope[data] = '';
                });
                $('#mycombotree0').combotree("clear");
            };
            // //自动填充创建人
            // $scope.autoComplete = function(){
            // 	$scope.creater = $rootScope.userData.username
            // }
            //获取脚本分组数据
            $scope.getTreeData = function(){
                httpLoad.loadData({
                    url: '/script/group/list',
                    method: 'POST',
                    data: {'parentId':0},
                    noParam:true,
                    success: function(data){
                        if(data.success && data.data && data.data.length!=0){
                            $scope.treeData = data.data;
                        }
                    }
                });
            };
            $scope.getTreeData();

            //点击脚本管理TAB页的时候触发
            $scope.getTree = function(){
                $scope.getScriptList(1);
                $scope.getTreeData();
            };
            //添加
            $scope.addScript = function(){
                $scope.treeData = $scope.treeData||"";
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/config/managescript/addScriptModal.html',
                    controller: 'addScriptModalCtrl',
                    backdrop: 'static',
                    keyboard:false,
                    size:'lg',
                    resolve: {
                        treeData: function(){
                            return $scope.treeData;
                        }
                    }
                });
                modalInstance.result.then(function (data) {
                    $scope.getScriptList();
                });
            };
            //编辑
            $scope.editScript = function(row){
                $scope.treeData = $scope.treeData||"";
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/config/managescript/editScriptModal.html',
                    controller: 'editScriptModalCtrl',
                    backdrop: 'static',
                    size:'lg',
                    keyboard:false,
                    resolve: {
                        item: function () {
                            return row;
                        },
                        treeData: function(){
                            return $scope.treeData;
                        }
                    }
                });
                modalInstance.result.then(function (data) {
                    $scope.groupId="";
                    $scope.getScriptList();
                });
            };
            //详情
            $scope.goDetail = function(id){
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/config/managescript/detailModal.html',
                    controller: 'detailScriptModalCtrl',
                    backdrop: 'static',
                    size:'lg',
                    keyboard:false,
                    resolve: {
                        id: function () {
                            return id;
                        }
                    }
                });
            };
            //删除
            $scope.delScript = function(id){
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/config/managescript/delScriptModal.html',
                    controller: 'delScriptModalCtrl',
                    backdrop: 'static',
                    resolve: {
                        id: function () {
                            return id;
                        }
                    }
                });
                modalInstance.result.then(function (data) {
                    $scope.getScriptList();
                });
            }
        }
    ]);
    //添加ctrl
    app.controller('addScriptModalCtrl', ['$scope', '$modalInstance', 'httpLoad', '$timeout','treeData',
        function ($scope, $modalInstance, httpLoad, $timeout,treeData) {
            $scope.index = 2;
            var aa=JSON.stringify(treeData);
            $scope.treeData=JSON.parse(aa);
            //获取脚本列表数据
            httpLoad.loadData({
                url:'/script/list',
                data:{
                    page:1,
                    rows:10,
                    simple:true
                },
                noParam:true,
                method:'POST',
                success:function(data){
                    if(data.success){
                        $scope.scriptListData = data.data.rows;
                    }
                }
            });
            //选择脚本来源
            $scope.source = 1;$scope.scriptType = "SHELL";
            $scope.selectSource = function () {
                $scope.source == 1 ? $scope.codeMirror.options.readOnly = false : $scope.codeMirror.options.readOnly = true;
            };
            //获取脚本内容
            $scope.scriptItem = {};
            $scope.getScriptValue = function(){
                httpLoad.loadData({
                    url:'/script/detail',
                    method:'GET',
                    data:{
                        id:$scope.scriptItem.selected.id
                    },
                    success:function(data){
                        if(data.success){
                            $scope.codeMirror.setValue(data.data.content);
                        }
                    }
                });
            };
            $timeout(function(){
                //选择本地脚本
                $('.file').on('change',function(){
                    var data = $(this)[0].files[0];
                    if (data) {
                        //将文件进行转码，转换为text
                        var reader = new FileReader();
                        reader.readAsText(data);
                        reader.onload = function (f) {
                            $scope.codeMirror.setValue(this.result);
                        }
                    }
                });
            },100);
            $scope.ok = function () {
                var sValues = $("#mycombotree2").combotree("getValues");
                var param = {
                    name: $scope.name,
                    content: $scope.codeMirror.getValue(),
                    type: $scope.scriptType,
                    groupId: sValues[0]
                };
                if(!param.groupId){
                    $scope.pop('请选择脚本分组','error');
                    return;
                }else  if(!param.content){
                    $scope.pop('请输入脚本内容','error');
                    return;
                }
                httpLoad.loadData({
                    url: '/script/create',
                    method: 'POST',
                    data: param,
                    success: function (data) {
                        if(data.success){
                            $scope.pop('脚本添加成功');
                            $modalInstance.close($scope.name);
                        }
                    }
                });
            }
            $scope.cancle = function () {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
    //编辑ctrl
    app.controller('editScriptModalCtrl', ['$scope', '$modalInstance', 'httpLoad', '$timeout','item','treeData',
        function ($scope, $modalInstance, httpLoad, $timeout, item,treeData) {
            $scope.name = item.name;$scope.source = 1;$scope.scriptType = item.type;$scope.groupId = item.groupId;$scope.groupName = item.groupName;
            $scope.index = 1;
            var aa=JSON.stringify(treeData);
            $scope.treeData=JSON.parse(aa);
            //获取脚本列表数据
            httpLoad.loadData({
                url:'/script/list',
                data:{
                    page:1,
                    rows:10,
                    simple:true
                },
                noParam:true,
                success:function(data){
                    $scope.scriptListData = data.data.rows;
                }
            })
            //选择脚本来源
            $scope.selectSource = function () {
                $scope.source == 1 ? $scope.codeMirror.options.readOnly = false : $scope.codeMirror.options.readOnly = true;
            }
            //获取脚本内容
            $scope.scriptItem = {};
            $scope.getScriptValue = function(id){
                httpLoad.loadData({
                    url:'/script/detail',
                    method:'GET',
                    data:{
                        id:id || $scope.scriptItem.selected.id
                    },
                    success:function(data){
                        if(data.success){
                            $timeout(function(){
                                $scope.codeMirror.setValue(data.data.content);
                            });
                        }
                    }
                });
            };
            $scope.getScriptValue(item.id);
            $timeout(function(){
                //选择本地脚本
                $('.file').on('change',function(){
                    var data = $(this)[0].files[0];
                    if (data) {
                        //将文件进行转码，转换为text
                        var reader = new FileReader();
                        reader.readAsText(data);
                        reader.onload = function (f) {
                            $scope.codeMirror.setValue(this.result);
                        }
                    }
                });
            },100);


            $scope.ok = function () {
                var sValues = $("#mycombotree1").combotree("getValues");
                var param = {
                    id: item.id,
                    name: $scope.name,
                    content: $scope.codeMirror.getValue(),
                    type: $scope.scriptType,
                    groupId: sValues[0]
                };
                if(!param.groupId){
                    $scope.pop('请选择脚本分组','error');
                    return;
                }else  if(!param.content){
                    $scope.pop('请输入脚本内容','error');
                    return;
                }
                httpLoad.loadData({
                    url: '/script/modify',
                    method: 'POST',
                    data: param,
                    success: function (data) {
                        $scope.pop('脚本编辑成功');
                        $modalInstance.close($scope.name);
                    }
                });
            }
            $scope.cancle = function () {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
    //详情ctrl
    app.controller('detailScriptModalCtrl', ['$scope', '$modalInstance', 'httpLoad', '$timeout','id',
        function ($scope, $modalInstance, httpLoad, $timeout, id) {
            (function(){
                httpLoad.loadData({
                    url:'/script/detail',
                    method:'GET',
                    data:{
                        id:id
                    },
                    success:function(data){
                        if(data.success){
                            $scope.detailData = data.data;
                            $timeout(function () {
                                $scope.codeMirror.options.readOnly = true;
                                $scope.codeMirror.setValue(data.data.content);
                            },11);

                            sessionStorage.setItem('scripttabLocation', JSON.stringify('scriptDetail'));
                        }
                    }
                });
            })();
            $scope.cancle = function () {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
    //删除ctrl
    app.controller('delScriptModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
        function ($scope, $modalInstance, httpLoad, id) {
            $scope.ok = function () {
                httpLoad.loadData({
                    url: '/script/remove',
                    method: 'POST',
                    data: {id: id},
                    success: function (data) {
                        if(data.success){
                            $scope.pop('脚本删除成功');
                            $modalInstance.close();
                        }
                    }
                });
            }
            $scope.cancle = function () {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
    //在线编辑指令
    app.directive('ngCodeMirrors', ['$timeout',function ($timeout) {
        return {
            restrict: 'EA',
            scope:{
                codeMirror: '='
            },
            link: function (scope, element, attrs) {
                var editor = $(element).find('.textarea')[0];
                $timeout(function(){
                    scope.codeMirror = CodeMirror.fromTextArea(editor, {
                        theme: 'erlang-dark',
                        mode: 'shell',
                        lineNumbers: true,
                        readOnly: false,
                        extraKeys: {
                            "F11": function(cm) {
                                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                            },
                            "Esc": function(cm) {
                                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                            }
                        }
                    });
                    //全屏展示
                    $(element).find('.icon-size-fullscreen').on('click',function(){
                        var escTip =  $('<div style="z-index:10000;font-size:16px;color:#f05050;position: fixed;top: 10px;left:50%;text-align: center;opacity: 1;font-weigth:bold;background-color: #e7fff8;padding:5px;width:400px;margin-left:-200px;">您现在处于全屏模式，按ESC键可以退出全屏！</div>');
                        $(document.body).append(escTip);
                        escTip.animate({
                            opacity : '0'
                        },5000,function(){
                            escTip.remove();
                        });
                        scope.codeMirror.setOption("fullScreen", true);
                    });
                },10);
            }
        }
    }]);

    angular.module('app').directive('easyCombotree',
        ['$rootScope', '$timeout', 'httpLoad', function ($rootScope,$timeout,httpLoad) {
            return {
                restrict: 'AE',
                scope : {
                    treeData        : '=',
                    groupId          : '=',
                    groupName          : '=',
                    index              : '='
                },
                link: function (scope, element, attrs) {
                    scope.$watch('treeData',function(newValue,oldValue){
                        element.combotree({
                            data: scope.treeData,
                            textField :"text",
                            valueField : "id",
                            emptyText : '请选择',
                            onBeforeExpand: function(row,param){
                                $('#mycombotree'+scope.index).combotree('tree').tree('options').url = '/script/group/list?parentId='+row.id;
                            },
                            onSelect:function(row) {
                                scope.groupId = row.id;
                                scope.groupName = row.text;
                            },
                            onLoadSuccess :function(node, data){
                                if(scope.groupId){
                                    /*for(var a in data){
                                     if(data[a].id==scope.groupId){
                                     scope.groupName = data[a].text;
                                     }
                                     }*/
                                    defaultValue('mycombotree1',scope.groupId,scope.groupName);
                                    /*$('#mycombotree').combotree('setValue',{
                                     id: scope.groupId,
                                     text: scope.groupName
                                     });*/
                                }
                                //deftext：生成节点的文本用于显示
                                function defaultValue(cbtid,defVal,defText){
                                    var combotree =$("#"+cbtid);
                                    var tree = combotree.combotree('tree');
                                    var defNode = tree.tree("find",defVal);
                                    if(!defNode){
                                        tree.tree('append', {
                                            data: [{
                                                id: defVal,
                                                name: defText,
                                                parentId:0,
                                                children:"",
                                                checked:false
                                            }]
                                        });
                                        defNode = tree.tree("find",defVal);
                                        combotree.combotree('setValue',defVal);
                                        tree.tree('select',defNode.target);
                                        defNode.target.style.display='none';
                                    }else{
                                        combotree.combotree('setValue',defVal);
                                    }
                                }
                            },
                            loadFilter: function(rows,parent){
                                if(rows.success) rows = rows.data;
                                var nodes = [];
                                // get the top level nodes
                                for(var i=0; i<rows.length; i++){
                                    var row = rows[i];
                                    var state = 'open';
                                    //if (!exists(rows, row.parentId)){
                                    if(row.children){
                                        state = 'closed';
                                        if(row.children=="[]") row.children=[];
                                    } else state = 'open';
                                    //}
                                    nodes.push({
                                        id:row.id,
                                        text:row.name,
                                        parentId:row.parentId,
                                        children:row.children,
                                        checked:row.checked,
                                        state:state
                                    });
                                }
                                return nodes;
                            }
                        });
                    });
                }
            };
        }]);
    app.controller('groupManageScriptCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            //$rootScope.moduleTitle = '系统管理 > 分组管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            //获取列表
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
            if(sessionStorage.getItem('scripttabLocation')!=null){
                var scripttabLocation = JSON.parse(sessionStorage.getItem('scripttabLocation'));
                if(scripttabLocation.indexOf("groupScript")>=0) $scope.getData();
            }

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
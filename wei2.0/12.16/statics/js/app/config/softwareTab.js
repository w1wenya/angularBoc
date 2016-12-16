(function(){
    app.constant('constantTool',{
        path : angular.element('#root_app_path').val()
    });
    app.controller('softwareTabCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            $rootScope.moduleTitle = '参数管理 > 软件仓库';//定义当前页
            $rootScope.link = '/statics/css/user.css';
            if(sessionStorage.getItem('softwaretabLocation')!=null){
                var softwaretabLocation = JSON.parse(sessionStorage.getItem('softwaretabLocation'));
                if(!softwaretabLocation){
                    $scope.active1 = true;
                } else{
                    if(softwaretabLocation.indexOf("software")>=0) $scope.active1 = true;
                    else $scope.active2 = true;
                }
            }else{
                $scope.active1 = true;$scope.active2 = false;
            }
        }
    ]);
    app.controller('manageSoftwareCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            //$rootScope.moduleTitle = '系统管理 > 分组管理';
            //$rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            $scope.isbatchDelete = true;
            $scope.index = 0;
            //获取列表
            $scope.getData = function(page,isSearch){
                $scope.param.page = page || $scope.param.page;
                var params = {
                        page: $scope.param.page,
                        rows: $scope.param.rows
                    },
                    searchParam = [];
                //如果是查询
                if(isSearch==0){
                    if($scope.searchByName&&$scope.searchByName!=""){
                        searchParam.push({"param":{"name":$scope.searchByName},"sign":"LK"});
                    }
                    if($scope.searchByPath&&$scope.searchByPath!=""){
                        if(searchParam.length==0) searchParam.push({"param":{"path":$scope.searchByPath},"sign":"LK"});
                        else {
                            var a = 0;
                            for(var i=0;i<searchParam.length;i++){
                                if(searchParam[i].sign=="LK") {
                                    a = 1;
                                    searchParam[i].param.path = $scope.searchByPath;
                                }
                            }
                            if(a==0) searchParam.push({"param":{"path":$scope.searchByPath},"sign":"LK"});
                        }
                    }
                    var sValues = $("#mycombotree0").combotree("getValues");
                    if(sValues[0]&&sValues[0]!=""){
                        searchParam.push({"param":{"groupId":sValues[0]},"sign":"EQ"});
                    }
                }

                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/software/list',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.softwareList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;
                            angular.forEach($scope.softwareList, function(data,index){
                                if(data.isLocked){
                                    data.isfreeze=false;
                                    data.isthaw=true;
                                }else{
                                    data.isfreeze=true;
                                    data.isthaw=false;
                                }
                            });
                        }else{
                            $scope.isImageData = true;
                        }
                    }
                });
            };
            if(sessionStorage.getItem('softwaretabLocation')!=null){
                var softwaretabLocation = JSON.parse(sessionStorage.getItem('softwaretabLocation'));
                if(softwaretabLocation.indexOf("software")>=0) $scope.getData(1);
            }else{
                $scope.getData(1);
            }

            //获取软件分组数据
            $scope.getTreeData = function(){
                httpLoad.loadData({
                    url: '/software/group/list',
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

            //点击软件管理TAB页的时候触发
            $scope.getTree = function(){
                $scope.getData(1);
                $scope.getTreeData();
            };
            //重置搜索条件
            $scope.reset = function(){
                var obj = ['searchByName','searchByPath'];
                angular.forEach(obj,function(data){
                    $scope[data] = '';
                });
                $('#mycombotree0').combotree("clear");
            };

            //下载
            $scope.download = function(row){
                httpLoad.loadData({
                    url:'/software/check',
                    method:'POST',
                    data: {path:row.path},
                    success:function(data){
                        if(data.success){
                            var params = JSON.stringify({path:row.path})
                            window.location.href = '/software/download?params='+ params;
                        }
                    }
                });
            };
            //新增
            $scope.add = function($event,size){
                $scope.treeData = $scope.treeData||"";
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/manageSoftware/add.html',
                    controller : 'addManageSoftwareModalCtrl',
                    backdrop: 'static',
                    size : size,
                    resolve: {
                        treeData: function(){
                            return $scope.treeData;
                        },
                        softwareList : function(){
                            return $scope.softwareList;
                        }
                    }
                });
                modalInstance.result.then(function () {
                    $scope.getData();
                });
            };
            //编辑
            $scope.update = function($event,$index,row,key,size){
                $event.stopPropagation();
                $scope.treeData = $scope.treeData||"";
                var modalInstance = $modal.open({
                    templateUrl : '/statics/tpl/config/manageSoftware/update.html',
                    controller : 'updateManageSoftwareModalCtrl',
                    size : size,
                    resolve : {
                        id : function(){
                            return row.id;
                        },
                        updateData : function(){
                            return $scope.softwareList[$index];
                        },
                        treeData: function(){
                            return $scope.treeData;
                        }
                    }
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
                    templateUrl : '/statics/tpl/config/manageSoftware/remove.html',
                    controller : 'removeManageSoftwareModalCtrl',
                    resolve : {
                        index : function(){
                            return $index;
                        },
                        removeData : function(){
                            return $scope.removeData;
                        },
                        softwareList : function(){
                            return $scope.softwareList;
                        }
                    }
                });
                modalInstance.result.then(function(){
                    $scope.getData();
                    $scope.isCheck = false;
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
                $state.go('app.config.manageSoftwareDetail',{id:id});
            };
        }
    ]);
    //新增ctrl
    angular.module('app').controller('addManageSoftwareModalCtrl',['$scope','$modalInstance','httpLoad','softwareList','treeData',
        function($scope,$modalInstance,httpLoad,softwareList,treeData){
            $scope.isSame=false;
            $scope.index = 2;
            $scope.addData={};
            var aa=JSON.stringify(treeData);
            $scope.treeData=JSON.parse(aa);
            //选中完脚本分组后请求文件路径
            //var sValues = $("#mycombotree").combotree("getValues");
            /* $scope.$watch(sValues[0],function(newVal){
             if(sValues[0]&&sValues[0]!=""){
             httpLoad.loadData({
             url:'/software/group/detail',
             method:'GET',
             data: {id: sValues[0]},
             success:function(data){
             if(data.success){
             $scope.addData.path = data.data.path;
             $scope.addData.groupId = sValues[0];
             }
             }
             });
             }
             });*/
            //上传
            $scope.isShowUploadFile = true;
            $scope.uploadFile = function(event){
                event.stopPropagation();
                $scope.isCheckUploadFileName = false;
                $scope.files = event.target.files;
            };
            $scope.submitUploadFile = function($event){
                $event.stopPropagation();
                //console.log($scope.path);
                var sValues = $("#mycombotree2").combotree("getValues");
                if(!sValues[0]){
                    $scope.pop('请先选择软件分组','error');
                    return;
                }
                if ($scope.files == undefined || $scope.files == null) {
                    $scope.isCheckUploadFileName = true;
                    $scope.checkUploadMessage  = "请选择应用文件！";
                    return;
                }
                if ($scope.files.length==0) {
                    $scope.isCheckUploadFileName = false;
                    $scope.checkUploadMessage  = "";
                    return;
                }
                var appFileName = $scope.files[0].name.split(".");
                if (!validate(appFileName[0])) {
                    $scope.isCheckUploadFileName = true;
                    $scope.checkUploadMessage  = "上传文件包含非法字符";
                    return;
                }
                /*if($scope.addData.type&&$scope.dockerImageId&&$scope.addData.type == $scope.dockerImageId){
                 if($scope.addData.category&&$scope.baseImageId&&$scope.addData.category == $scope.baseImageId){
                 //容器镜像/基础镜像：上传时检查后缀名.tar
                 if ("tar" != appFileName[appFileName.length - 1]) {
                 $scope.isCheckUploadFileName = true;
                 $scope.checkUploadMessage  = "只能上传.tar文件！";
                 return;
                 }
                 }
                 }else{
                 if ("war" != appFileName[appFileName.length - 1] && "ear" != appFileName[appFileName.length - 1] && "jar" != appFileName[appFileName.length - 1]) {
                 $scope.checkUploadMessage  = "只能上传.war/.ear/.jar文件！";
                 $scope.isCheckUploadFileName = true;
                 return;
                 }
                 }*/
                if($scope.files != null) {
                    $scope.isCheckUploadFileName = false;
                }else {
                    $scope.isUploadFile = true;
                    $scope.checkUploadMessage  =  "请先选择需要上传的应用文件！";
                    return;
                }
                function validate(str){            //非法字符验证
                    if (str.indexOf(" ") == -1) {
                        return true;
                    } else {
                        return false;
                    }
                }
                $scope.uploadFileRate = 0;
                $scope.isShowUploadFile = false;
                $scope.startSize = 0;$scope.endSize = 0;
                //var host = constantTool.path.substring(5,constantTool.path.length);
                var host = location.hostname + ':' +location.port;
                var url = 'ws://'+ host +'/uploadService';
                var socket2 = new WebSocket(url);
                var i = 0;
                var paragraph = 4 * 1024 * 1024;    //以4MB为一个分片
                var count = parseInt($scope.files[0].size/paragraph) + 1;
                //延迟
                var waitForConnection = function (callback, interval) {
                    if (socket2.readyState === 1) {
                        callback();
                    } else {
                        var that = this;
                        setTimeout(function () {
                            waitForConnection(callback, interval);
                        }, interval);
                    }
                };
                socket2.onopen = function(){
                    waitForConnection(function () {
                        socket2.send(JSON.stringify({
                            'filename' : $scope.files[0].name,
                            'path' : $scope.path,
                            'upload':'image'
                        }));
                    }, 1000);
                };
                socket2.onmessage = function(event){
                    var blob;
                    var obj = JSON.parse(event.data);
                    if (obj.category == "UPLOAD_ACK") {
                        $scope.recievedPath = obj.content;
                        $scope.isDeleteUploadFile = true;
                        if ($scope.startSize < $scope.files[0].size) {
                            $scope.startSize = $scope.endSize;
                            $scope.endSize += paragraph;

                            if ($scope.files[0].webkitSlice) {
                                blob = $scope.files[0].webkitSlice($scope.startSize, $scope.endSize);
                            } else if ($scope.files[0].mozSlice) {
                                blob = $scope.files[0].mozSlice($scope.startSize, $scope.endSize);
                            } else {
                                blob = $scope.files[0].slice($scope.startSize, $scope.endSize);
                            }
                            var reader = new FileReader();
                            reader.readAsArrayBuffer(blob);

                            reader.onload = function loaded(evt) {
                                var result = evt.target.result;
                                i++;
                                var isok = (i / count) *100;
                                $scope.uploadFileRate = parseInt(isok);
                                socket2.send(result);
                            };
                        }
                    }else if(obj.category == 'UPLOAD'){
                        if(obj.content == 'SAVE_FAILURE'){
                            $scope.isCheckUploadFileName = true;
                            $scope.checkUploadMessage  = "上传失败,请重试！";
                            $scope.isShowUploadFile = true;
                        }else if(obj.content == 'SAVE_SUCCESS'){
                            if ($scope.endSize < $scope.files[0].size) {
                                //var start = new Date().getMilliseconds();
                                $scope.startSize = $scope.endSize;
                                $scope.endSize += paragraph;
                                if ($scope.files[0].webkitSlice) {
                                    blob = $scope.files[0].webkitSlice($scope.startSize, $scope.endSize);
                                } else if ($scope.files[0].mozSlice) {
                                    blob = $scope.files[0].mozSlice($scope.startSize, $scope.endSize);
                                } else {
                                    blob = $scope.files[0].slice($scope.startSize, $scope.endSize);
                                }
                                var reader = new FileReader();
                                reader.readAsArrayBuffer(blob);
                                reader.onload = function loaded(evt) {
                                    var ArrayBuffer = evt.target.result;
                                    i++;
                                    var isok = (i / count) *100;
                                    $scope.uploadFileRate = parseInt(isok);
                                    //var stop = new Date().getMilliseconds();
                                    //console.log("read file cost:"+(stop-start));
                                    socket2.send(ArrayBuffer);
                                };
                            } else {
                                $scope.startSize = $scope.endSize = 0;
                                i = 0;
                                $scope.isCheckUploadFileName = true;
                                $scope.checkUploadMessage  = "上传完成！";
                                $scope.uploadFileRate = 100;
                                $scope.isDeleteUploadFile = false;
                                sendfileEnd();
                            }
                        }else if(obj.content == 'TRUE'){
                            $scope.addData.path = $scope.recievedPath;
                            socket2.close();
                        }
                    }else if(obj.category == 'UPLOAD_CANCEL'){
                        $scope.isCheckUploadFileName = true;
                        $scope.checkUploadMessage = "已取消上传,请重新上传！";
                        $scope.isShowUploadFile = true;
                        //$scope.isCheckUploadFileName = false;
                        socket2.close();
                    }
                    $scope.$apply($scope.uploadFileRate);
                };

                function sendfileEnd() {
                    socket2.send(JSON.stringify({
                        'sendover' : 'sendover'
                    }));
                }
                //取消上传
                $scope.deleteUploadFile = function($event){
                    $event.stopPropagation();
                    socket2.send(JSON.stringify({
                        'UPLOAD_CANCEL' : 'UPLOAD_CANCEL'
                    }));
                };
            };

            $scope.ok = function(){
                //$scope.addData.path = $scope.path;
                if(!$scope.addData.path){
                    $scope.pop('请上传文件','error');
                    return;
                }
                $scope.addData.groupId = $scope.groupId;
                httpLoad.loadData({
                    url:'/software/create',
                    method:'POST',
                    data: $scope.addData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('软件添加成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            };
        }]);
    //编辑ctrl
    angular.module('app').controller('updateManageSoftwareModalCtrl',['$scope','$modalInstance','httpLoad','updateData','treeData',
        function($scope,$modalInstance,httpLoad,updateData,treeData){
            var aa=JSON.stringify(updateData);
            $scope.updateData=JSON.parse(aa);
            var bb=JSON.stringify(treeData);
            $scope.treeData=JSON.parse(bb);
            $scope.index = 1;

            $scope.groupId = $scope.updateData.groupId;$scope.groupName = $scope.updateData.groupName;
            $scope.ok = function(){
                var sValues = $("#mycombotree1").combotree("getValues");
                $scope.updateData.groupId = sValues[0];
                httpLoad.loadData({
                    url:'/software/modify',
                    method:'POST',
                    data: $scope.updateData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('软件编辑成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            };
        }]);
    //删除ctrl
    angular.module('app').controller('removeManageSoftwareModalCtrl',['$scope','$modalInstance','httpLoad','removeData','softwareList','index',
        function($scope,$modalInstance,httpLoad,removeData,softwareList,index){
            $scope.ok = function(){
                httpLoad.loadData({
                    url:'/software/remove',
                    method:'POST',
                    data: removeData,
                    success:function(data){
                        if(data.success){
                            $scope.pop('软件删除成功');
                            $modalInstance.close();
                        }
                    }
                });
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            };
        }]);

    //上传指令
    angular.module('app').directive('customOnChange', function() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.bind('change', onChangeHandler);
            }
        };
    });

    angular.module('app').directive('softwareCombotree',
        ['$rootScope', '$timeout', 'httpLoad', function ($rootScope,$timeout,httpLoad) {
            return {
                restrict: 'AE',
                scope : {
                    treeData        : '=',
                    groupId          : '=',
                    groupName         :'=',
                    path              : '=',
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
                                $('#mycombotree'+scope.index).combotree('tree').tree('options').url = '/software/group/list?parentId='+row.id;
                            },
                            onSelect:function(row) {
                                scope.groupId = row.id;
                                httpLoad.loadData({
                                    url:'/software/group/detail',
                                    method:'GET',
                                    data: {id: row.id},
                                    success:function(data){
                                        if(data.success){
                                            scope.path = data.data.path;
                                        }
                                    }
                                });
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
    app.controller('groupManageSoftwareCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout) {
            //$rootScope.moduleTitle = '系统管理 > 分组管理';
            $rootScope.link = '/statics/css/user.css';//引入页面样式
            $scope.param = {
                rows: 10
            };
            //获取列表
            $scope.isbatchDelete = true;
            //获取软件分组列表
            $scope.getData = function(param){
                param = param||{'parentId':0};
                httpLoad.loadData({
                    url: '/software/group/list',
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
            if(sessionStorage.getItem('softwaretabLocation')!=null){
                var softwaretabLocation = JSON.parse(sessionStorage.getItem('softwaretabLocation'));
                if(softwaretabLocation.indexOf("groupSoftware")>=0) $scope.getData();
            }

            //添加/编辑
            $scope.add = function(flag,item,$event){
                if($event) $event.stopPropagation();
                var modalInstance = $modal.open({
                    templateUrl: '/statics/tpl/config/groupManageSoftware/add.html',
                    controller: 'addGroupManageSoftwareModalCtrl',
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
                    templateUrl: '/statics/tpl/config/groupManageSoftware/remove.html',
                    controller: 'delGroupManageSoftwareModalCtrl',
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
                $state.go('app.config.groupManageSoftwareDetail',{id:item.id});
            };
        }
    ]);
    //添加/编辑ctrl
    angular.module('app').controller('addGroupManageSoftwareModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'flag', 'itemData',
        function($scope, $modalInstance,  httpLoad, flag, itemData) {
            //编辑对象
            var editObj = ['id','name','remark','code'];
            $scope.modalName = '添加软件分组';
            var url = '/software/group/create';
            //如果为编辑，进行赋值
            if(flag == 2){
                url = '/software/group/modify';
                $scope.modalName = '编辑软件分组';
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
                            var popText = '软件分组添加成功';
                            if(flag == 2) popText = '软件分组修改成功';
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
    angular.module('app').controller('delGroupManageSoftwareModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
        function($scope, $modalInstance, httpLoad, id) {
            $scope.ok = function(){
                httpLoad.loadData({
                    url: '/software/group/remove',
                    data: {id: id},
                    success: function(data){
                        if(data.success){
                            $scope.pop("软件分组删除成功");
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


angular.module('app').directive('groupsoftwareGrid', ['$rootScope', '$timeout', 'httpLoad',
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
                        //method: 'GET',
                        //url:'/resources/data/operation/permission/permissionList.json',
                        data: scope.treeData,
                        dataType:'json',
                        idField:'id',
                        treeField:'name',
                        animate: true,
                        fitColumns:true,
                        //width: $(this).width()*0.843,
                        onBeforeExpand: function(row,param){
                            if(row&&row.children1){
                                //$(this).treegrid('options').url='/resources/data/operation/permission/test.json?parentId='+row.id+'&id='+row.id;
                                httpLoad.loadData({
                                    url: '/software/group/list',
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
                            {field:'status',title:'分组状态',width:'10%',align:'center'},
                            {field:'code',title:'编码',width:'25%',align:'center'},
                            {field:'operate',title:'操作',width:'35%',align:'center',
                                formatter: function(value,row,index){
                                    row.parentId = row.parentId || 0;
                                    var id=row.id,
                                        parentId=row.parentId,
                                        name=row.name,
                                        remark=row.remark||"",
                                        code=row.code||"";
                                    var html='';
                                    html+='<button class="btn btn-primary btn-sm addName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" remark="'+remark+'" code="'+code+'"><i class="fa fa-plus-circle icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">新增</span></button>'+ '&nbsp;&nbsp;';//默认只有二级节点
                                    html+='<button class="btn btn-success btn-sm updateName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" remark="'+remark+'" code="'+code+'"><i class="fa fa-pencil-square-o icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">编辑</span></button>'+ '&nbsp;&nbsp;';
                                    html+='<button class="btn btn-danger btn-sm deleteName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" remark="'+remark+'" code="'+code+'"><i class="fa fa-trash-o icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">删除</span></button>'+ '&nbsp;&nbsp;';
                                    html+='<button class="btn btn-info btn-sm detailName" id="'+id+'" parentId="'+parentId+'" name="'+name+'" remark="'+remark+'" code="'+code+'"><i class="fa fa-info-circle icon-font"></i><span class="icon-txt" style="font-size: 14px;padding-left: 3px;">详情</span></button>';

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
                                    remark :  _this.attr("remark"),
                                    code : _this.attr("code")
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
                                    remark :  _this.attr("remark"),
                                    code : _this.attr("code")
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
(function(){
    "use strict";
    app.controller('NewTopologyCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','LANGUAGE',
        function($scope, httpLoad, $rootScope, $modal,$state, $timeout,LANGUAGE) {
            $rootScope.moduleTitle = '监控管理 > 数据纵览';//定义当前页
            //$rootScope.link = '/statics/css/tree-control.css';//引入页面样式
            $scope.param = {
                rows: 10,
                page:1
            };
            //树形结构
            $scope.treeOptions = {
                nodeChildren: "children",
                dirSelectable: true,
                injectClasses: {
                    ul: "a1",
                    li: "a2",
                    liSelected: "a7",
                    iExpanded: "a3",
                    iCollapsed: "a4",
                    iLeaf: "a5",
                    label: "a6",
                    labelSelected: "a8"
                }
            };
            $scope.expandedNodes = [];
            $scope.selectNode = function(node) {
                $scope.selected = node;
            };
            //获取树形菜单数据
            $scope.getTreeData = function(actionName){
                var params = {
                    sign:""
                };
                if($scope.searchByName&&$scope.searchByName!=""){
                    params.sign = $scope.searchByName;
                }
                httpLoad.loadData({
                    url:'/monitor/queryEquipmentAllType',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success: function(data){
                        if(data.success&&data.data){
                            $scope.dataForTheTree = data.data;
                            angular.forEach($scope.dataForTheTree, function(data,index){
                                data.action = 1;
                                $scope.expandedNodes.push(data);
                                if(data.children&&data.children.length>0){
                                    angular.forEach(data.children, function(data1,index1){
                                        data1.action = 2;
                                        $scope.expandedNodes.push(data1);
                                        if(data1.children&&data1.children.length>0){
                                            angular.forEach(data1.children, function(data2,index2) {
                                                data2.action = 3;
                                                $scope.expandedNodes.push(data2);
                                            });
                                        }
                                    });
                                }
                            });

                            if(actionName== 0){
                                //如果是查询，默认选中
                                for(var i=0;i<$scope.dataForTheTree.length;i++){
                                    if($scope.dataForTheTree[i].children&&$scope.dataForTheTree[i].children.length>0){
                                        for(var j=0;j<$scope.dataForTheTree[i].children.length;j++){
                                            if(j==0){
                                                $scope.selectNode($scope.dataForTheTree[i].children[j]);
                                                $scope.getData(1,$scope.selected);
                                                return false;
                                            }else{
                                                if($scope.dataForTheTree[i].children[j].children&&$scope.dataForTheTree[i].children[j].children.length>0){
                                                    for(var k=0;k<$scope.dataForTheTree[i].children[j].children.length;k++){
                                                        if(k == 0) {
                                                            $scope.selectNode($scope.dataForTheTree[i].children[j].children[k]);
                                                            $scope.getData(1,$scope.selected);
                                                            return false;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            };

            $scope.isImageData = true;
            $scope.getData = function(page,node){
                if(node){
                    if(node.action==1) return;
                    else $scope.node = node;
                }

                $scope.param.page = page || $scope.param.page;

                var params = {};
                var searchParam = $scope.node;
                searchParam.page = $scope.param.page;
                searchParam.rows = $scope.param.rows;
                params.params = JSON.stringify(searchParam);
                httpLoad.loadData({
                    url:'/monitor/status/query',
                    method: 'POST',
                    data: params,
                    noParam: true,
                    success:function(data){
                        //console.log(params);
                        if(data.success&&data.data.rows&&data.data.rows.length!=0){
                            $scope.commandList = data.data.rows;
                            $scope.totalCount = data.data.total;
                            $scope.isImageData = false;

                            //angular.forEach($scope.commandList, function(data,index){
                            //    var list = data.message.split('，');
                            //    data.num1 = list[0].substr(2);
                            //    data.num2 = list[1].substr(2);
                            //});
                        }else{
                            $scope.isImageData = true;
                        }

                        var topoLocation = {
                            page: $scope.param.page,
                            location:'topo',
                            node:$scope.node
                        };
                        sessionStorage.topoLocation = JSON.stringify(topoLocation);
                    }
                });
            };

            //返回当前页面时
            if(sessionStorage.topoLocation){
                var topoLocation = JSON.parse(sessionStorage.topoLocation);
                if(topoLocation&&topoLocation.location.indexOf("detail")>=0) {
                    if(sessionStorage.topoMonitorData&&sessionStorage.topoMonitorData!=""){
                        $scope.getTreeData();
                        $scope.selectNode(JSON.parse(sessionStorage.topoLocation).node);
                        $scope.getData(topoLocation.page,JSON.parse(sessionStorage.topoLocation).node);
                    }
                }else{
                    $scope.getTreeData();
                }
            }else {
                $scope.getTreeData();
            }
            //监控
            $scope.goMonitor = function(node){
                $state.go('app.monitor.monitor');
                var topoMonitorData = node;
                sessionStorage.topoMonitorData = JSON.stringify(topoMonitorData);
            }
        }
    ]);
})();



//(function () {
//    app.factory('NewTopologyService',['$rootScope','httpLoad','$modal', '$timeout', '$stateParams',	function ($rootScope, httpLoad, $modal, $timeout, $stateParams) {
//        var NewTopologyService = function () {
//            this.Init();
//        };
//        NewTopologyService.prototype = {
//            Init:function(){
//                //初始化内容
//                this.InitContent();
//            },
//            InitContent:function(){
//                this.scene = new JTopo.Scene();
//                this.scene.background = '/statics/img/topology/bg.jpg';
//                var canvas = document.getElementById('canvas');
//                canvas.height = window.innerHeight * 0.7;
//                canvas.width = window.innerWidth * 0.80;
//                this.width = window.innerWidth;
//                this.height = window.innerHeight;
//                this.stage = new JTopo.Stage(canvas);
//                this.stage.eagleEye.visible = false;
//                this.stage.add(this.scene);
//                this.ShowJTopoToolBar(this.stage);
//            },
//            ShowJTopoToolBar:function(stage){
//                stage.mode = 'edit';
//                var that = this;
//                var toobarDiv = $('<div class="jtopo_toolbar">').html(''
//                        // +'<label class="i-checks i-checks-sm m-r-xs"> <input type="radio" name="modeRadio" value="normal" checked id="r1"><i></i>默认</label>'
//                        // +'<label class="i-checks i-checks-sm m-r-xs"> <input type="radio" name="modeRadio" value="select" id="r2"><i></i>框选</label>'
//                        // +'<label class="i-checks i-checks-sm m-r-xs"> <input type="radio" name="modeRadio" value="drag" id="r3"><i></i>平移</label>'
//                        // +'<label class="i-checks i-checks-sm m-r-md"> <input type="radio" name="modeRadio" value="edit" id="r4"><i></i>编辑</label>'
//                    //+'<input type="text" id="findText" class="form-control" value="" onkeydown="findButton.click()" style="display: inline-block;width: 200px;height: 26px">'
//                    //+'<button class="btn m-b-xs btn-xs btn-primary m-l-xs m-t-xs" id="findButton"><i class="icon-magnifier"></i> 查 询</button>'
//                    +'<button class="btn btn-xs btn-success pull-right m-t-xs" id="exportButton"><i class="fa fa-floppy-o"></i> 导出PNG</button>'
//                    +'<button class="btn btn-xs btn-info m-r-xs pull-right m-t-xs"  id="fullScreenButton"><i class="icon-size-fullscreen"></i> 全 屏</button>'
//                    +'<button class="btn btn-xs btn-primary m-r-xs pull-right m-t-xs"  id="centerButton"><i class="fa fa-align-center"></i> 居 中</button>'
//                    +'<button class="btn btn-xs btn-success m-r-xs pull-right m-t-xs"  id="zoomOutButton"><i class="icon-magnifier-add"></i>  放 大</button>'
//                    +'<button class="btn btn-xs btn-danger m-r-xs pull-right m-t-xs"  id="zoomInButton"><i class="icon-magnifier-remove"></i>  缩 小</button>'
//                    +'<label class="i-checks i-checks-sm m-r m-t-xs pull-right" ><input type="checkbox" id="zoomCheckbox" ><i></i>鼠标缩放</label>'
//                );
//                $('#content').prepend(toobarDiv);
//
//                // 工具栏按钮处理
//                // $("input[name='modeRadio']").click(function(){
//                // 	stage.mode = $("input[name='modeRadio']:checked").val();
//                // 	console.log(that.stage.mode);
//                // });
//                $('#centerButton').click(function(){
//                    stage.centerAndZoom(); //缩放并居中显示
//                });
//                $('#zoomOutButton').click(function(){
//                    stage.zoomOut();
//                });
//                $('#zoomInButton').click(function(){
//                    stage.zoomIn();
//                });
//                $('#exportButton').click(function(){
//                    stage.saveImageInfo();
//                });
//                $('#zoomCheckbox').click(function(){
//                    $(this).toggleClass('checked');
//                    if($('#zoomCheckbox').hasClass('checked')){
//                        stage.wheelZoom = 1.15; // 设置鼠标缩放比例
//                    }else{
//                        stage.wheelZoom = null; // 取消鼠标缩放比例
//                    }
//                });
//                $('#fullScreenButton').click(function(){
//                    runPrefixMethod(stage.canvas, "RequestFullScreen")
//                });
//                // 查询
//                //$('#findButton').click(function(){
//                //    var text = $('#findText').val().trim();
//                //    var nodes = stage.find('node[text="'+text+'"]');
//                //    if(nodes.length > 0){
//                //        var node = nodes[0];
//                //        node.selected = true;
//                //        var location = node.getCenterLocation();
//                //        // 查询到的节点居中显示
//                //        stage.setCenter(location.x, location.y);
//                //        function nodeFlash(node, n){
//                //            if(n == 0) {
//                //                node.selected = false;
//                //                return;
//                //            };
//                //            node.selected = !node.selected;
//                //            setTimeout(function(){
//                //                nodeFlash(node, n-1);
//                //            }, 300);
//                //        }
//                //        // 闪烁几下
//                //        nodeFlash(node, 6);
//                //    }
//                //});
//            },
//
//            //初始绘制节点
//            DrawNode:function(d1,d2){
//                var that = this;
//                var width = that.width; var height = that.height;
//                //清除节点数据
//                that.scene.clear();
//                var img = {
//                    router:'router.jpg',
//                    switch:'switch.jpg',
//                    other:'other.jpg'
//                };
//                var routerData = [],switchData = [],otherData = [];
//                angular.forEach(d1, function(data1,index1){
//                    switch(data1.type) {
//                        case 'router':
//                            routerData.push({uuid:data1.uuid,sysName:data1.sysName,type:data1.type,routerItems:[],switchItems:[],otherItems:[]});
//                            break;
//                        case 'switch':
//                            switchData.push({uuid:data1.uuid,sysName:data1.sysName,type:data1.type,routerItems:[],switchItems:[],otherItems:[]});
//                            break;
//                        case 'other':
//                            otherData.push({uuid:data1.uuid,sysName:data1.sysName,type:data1.type,routerItems:[],switchItems:[],otherItems:[]});
//                            break;
//                    }
//                });
//                angular.forEach(routerData, function(data1,index1){
//                    angular.forEach(d2, function(data2,index2){
//                        if(data1.uuid==data2.leftUuid){
//                            d1.forEach(function(item3){
//                                if(item3.uuid==data2.rightUuid) {
//                                    if(item3.type=='router') data1.routerItems.push({uuid:item3.uuid,sysName:item3.sysName,type:item3.type});
//                                    if(item3.type=='switch') data1.switchItems.push({uuid:item3.uuid,sysName:item3.sysName,type:item3.type});
//                                    if(item3.type=='other')  data1.otherItems.push({uuid:item3.uuid,sysName:item3.sysName,type:item3.type});
//                                }
//                            });
//                        }else if(data1.uuid==data2.rightUuid){
//                            d1.forEach(function(item4){
//                                if(item4.uuid==data2.leftUuid) {
//                                    if(item4.type=='router') data1.routerItems.push({uuid:item4.uuid,sysName:item4.sysName,type:item4.type});
//                                    if(item4.type=='switch') data1.switchItems.push({uuid:item4.uuid,sysName:item4.sysName,type:item4.type});
//                                    if(item4.type=='other')  data1.otherItems.push({uuid:item4.uuid,sysName:item4.sysName,type:item4.type});
//                                }
//                            });
//                        }
//                    });
//                });
//                angular.forEach(switchData, function(data1,index1){
//                    angular.forEach(d2, function(data2,index2){
//                        if(data1.uuid==data2.leftUuid){
//                            d1.forEach(function(item3){
//                                if(item3.uuid==data2.rightUuid) {
//                                    if(item3.type=='router') data1.routerItems.push({uuid:item3.uuid,sysName:item3.sysName,type:item3.type});
//                                    if(item3.type=='switch') data1.switchItems.push({uuid:item3.uuid,sysName:item3.sysName,type:item3.type});
//                                    if(item3.type=='other')  data1.otherItems.push({uuid:item3.uuid,sysName:item3.sysName,type:item3.type});
//                                }
//                            });
//                        }else if(data1.uuid==data2.rightUuid){
//                            d1.forEach(function(item4){
//                                if(item4.uuid==data2.leftUuid) {
//                                    if(item4.type=='router') data1.routerItems.push({uuid:item4.uuid,sysName:item4.sysName,type:item4.type});
//                                    if(item4.type=='switch') data1.switchItems.push({uuid:item4.uuid,sysName:item4.sysName,type:item4.type});
//                                    if(item4.type=='other')  data1.otherItems.push({uuid:item4.uuid,sysName:item4.sysName,type:item4.type});
//                                }
//                            });
//                        }
//                    });
//                });
//                angular.forEach(otherData, function(data1,index1){
//                    angular.forEach(d2, function(data2,index2){
//                        if(data1.uuid==data2.leftUuid){
//                            d1.forEach(function(item3){
//                                if(item3.uuid==data2.rightUuid) {
//                                    if(item3.type=='router') data1.routerItems.push({uuid:item3.uuid,sysName:item3.sysName,type:item3.type});
//                                    if(item3.type=='switch') data1.switchItems.push({uuid:item3.uuid,sysName:item3.sysName,type:item3.type});
//                                    if(item3.type=='other')  data1.otherItems.push({uuid:item3.uuid,sysName:item3.sysName,type:item3.type});
//                                }
//                            });
//                        }else if(data1.uuid==data2.rightUuid){
//                            d1.forEach(function(item4){
//                                if(item4.uuid==data2.leftUuid) {
//                                    if(item4.type=='router') data1.routerItems.push({uuid:item4.uuid,sysName:item4.sysName,type:item4.type});
//                                    if(item4.type=='switch') data1.switchItems.push({uuid:item4.uuid,sysName:item4.sysName,type:item4.type});
//                                    if(item4.type=='other')  data1.otherItems.push({uuid:item4.uuid,sysName:item4.sysName,type:item4.type});
//                                }
//                            });
//                        }
//                    });
//                });
//                //取出没有与任何路由器相连的交换机
//                //var noSwitchData = switchData;
//                //angular.forEach(switchData, function(data1,index1){
//                //    angular.forEach(d2, function(data2,index2){
//                //        if(data1.uuid==data2.leftUuid||data1.uuid==data2.rightUuid){
//                //            noSwitchData.splice(index1,1);
//                //        }
//                //    });
//                //});
//
//                //先设置一个在中间不可见的节点
//                that.AddNode(500,200,null,null,null,null,null);
//                //设置路由器节点
//                var nodeList = [];//把所有创建过的节点存进去
//                routerData.forEach(function(item){
//                    var a = that.AddNode(null,null,item.sysName,img[item.type],'Bottom_Center',item.type,item);
//                    nodeList.push(a);
//                    //that.AddCircleNode(item.sysName,img[item.type],'Bottom_Center',item.type,item);
//                    //找到与路由器相连接的交换机，创建圆形布局节点
//                    if(item.switchItems.length!=0) {
//                        item.switchItems.forEach(function(item1){
//                            switchData.forEach(function(it){
//                                if(it.uuid==item1.uuid){
//                                    var b = that.AddNode(width * Math.random(),height * Math.random(),it.sysName,img[it.type],'Bottom_Center',it.type,it);
//                                    nodeList.push(b);
//                                    //that.AddCircleNode(item1.sysName,img[item1.type],'Bottom_Center',item1.type,item1);
//                                    //找到与交换机相连的主机，设置主机节点
//                                    if(it.otherItems.length!=0){
//                                        it.otherItems.forEach(function (item3) {
//                                            otherData.forEach(function(it1){
//                                                if(it1.uuid==item3.uuid) {
//                                                    var c = that.AddNode(width * Math.random(), height * Math.random(), it1.sysName, img[it1.type], 'Bottom_Center', it1.type, it1);
//                                                    nodeList.push(c);
//                                                    //that.AddCircleNode(item2.sysName,img[item2.type],'Bottom_Center',item2.type,item2);
//                                                }
//                                            });
//                                        });
//                                    }
//                                }
//                            });
//                        });
//                    }
//                });
//                //设置没有与任何路由器连接的交换机节点
//                //if(noSwitchData.length!=0) {
//                //    switchData.forEach(function(item){
//                //        var a = that.AddNode(width * Math.random(),height * Math.random(),item.sysName,img[item.type],'Bottom_Center',item.type,item);
//                //        nodeList.push(a);
//                //        //that.AddCircleNode(item.sysName,img[item.type],'Bottom_Center',item.type,item);
//                //        //设置主机节点
//                //        if(item.otherItems.length!=0){
//                //            item.otherItems.forEach(function(item2){
//                //                var b = that.AddNode(width * Math.random(),height * Math.random(),item2.sysName,img[item2.type],'Bottom_Center',item2.type,item2);
//                //                nodeList.push(b);
//                //                //that.AddCircleNode(item2.sysName,img[item2.type],'Bottom_Center',item2.type,item2);
//                //            });
//                //        }
//                //    });
//                //}
//
//                //先连接互相连接的路由器连线
//                that.scene.link = [];
//                nodeList.forEach(function (item) {
//                    if(item.nodeType=='router') {
//                        item.routerItems.forEach(function (item1) {
//                            nodeList.forEach(function (item2) {
//                                if(item2.uuid==item1.uuid) {
//                                    var result = that.JudgeLink(item,item2);
//                                    if(result==false){
//                                        var a = that.AddLink(item, item2);
//                                        that.scene.link.push({"beginNode":item,"endNode":item2});
//                                    }
//                                }
//                            });
//                        });
//                        //再连接路由器和交换机的连线
//                        item.switchItems.forEach(function (item3) {
//                            nodeList.forEach(function (item4) {
//                                if(item4.uuid==item3.uuid) {
//                                    var result = that.JudgeLink(item,item4);
//                                    if(result==false){
//                                        var a = that.AddLink(item, item4);
//                                        that.scene.link.push({"beginNode":item,"endNode":item4});
//                                    }
//                                }
//                            });
//                        });
//                    }
//                    //再连接交换机和交换机之间的连线
//                    if(item.nodeType=='switch') {
//                        item.switchItems.forEach(function (item5) {
//                            nodeList.forEach(function (item6) {
//                                if(item6.uuid==item5.uuid) {
//                                    var result = that.JudgeLink(item,item6);
//                                    if(result==false){
//                                        var a = that.AddLink(item, item6);
//                                        that.scene.link.push({"beginNode":item,"endNode":item6});
//                                    }
//                                }
//                            });
//                        });
//                        //再连接交换机和主机之间的连线
//                        item.otherItems.forEach(function (item7) {
//                            nodeList.forEach(function (item8) {
//                                if(item8.uuid==item7.uuid) {
//                                    var result = that.JudgeLink(item,item8);
//                                    if(result==false){
//                                        var a = that.AddLink(item, item8);
//                                        that.scene.link.push({"beginNode":item,"endNode":item8});
//                                    }
//                                }
//                            });
//                        });
//                    }
//                });
//
//            },
//            //对连线进行判断
//            JudgeLink:function(beginNode,endNode){
//                var that = this;
//                var data = that.scene.link;
//                var flag = false;
//                if(data.length==0) flag = false;
//                for(var i=0;i<data.length;i++){
//                    if((beginNode==data[i].beginNode&&endNode==data[i].endNode)||(beginNode==data[i].endNode&&endNode==data[i].beginNode)){
//                        flag = true;
//                    }
//                }
//                return flag;
//            },
//            //添加节点
//            AddNode:function(x, y, str, img, textPosition, nodeType, nodeData){
//                var that = this;
//                var node = new JTopo.Node(str);
//                var axis = x||that.stage.canvas.clientWidth*Math.random();
//                var yxis = y||that.stage.canvas.clientHeight*Math.random();
//                node.setLocation(axis,yxis);
//                //if(nodeData){
//                //    node.id = nodeData.nodeId;
//                //    node.nodeData = nodeData.data;
//                //}
//                node.textPosition = textPosition;//设置文字位置
//                node.fontColor = '88,102,110';//设置文字颜色
//                node.setSize(20,20);//设置图标大小
//                if(nodeData==null){
//                    node.visible = false;
//                    node.layout = {type: 'circle', radius: 10};
//                }else{
//                    node.visible = true;
//                    node.layout = {type: 'circle', radius: 50};
//                    node.uuid = nodeData.uuid;
//                    node.routerItems = nodeData.routerItems;node.switchItems = nodeData.switchItems;node.otherItems = nodeData.otherItems;
//                    node.nodeType = nodeData.type;
//                }
//                if (null != img) {
//                    node.setImage('/statics/img/topology/' + img, false);
//                    node.Image = img;
//                }
//                //this.EveSetNode(node);
//                this.scene.add(node);
//                return node;
//            },
//            //添加圆形布局节点
//            AddCircleNode:function(str, img, textPosition, nodeType, nodeData){
//                var node = new JTopo.CircleNode(str);
//                node.setLocation(this.scene.width * Math.random(), this.scene.height * Math.random());
//                if(nodeData.type=='router') node.layout = {type: 'circle', radius: 10};
//                if(nodeData.type=='switch') node.layout = {type: 'circle', radius: 20};
//                //node.id = new Date().getTime() + x;
//                //if(nodeData){
//                //    node.id = nodeData.nodeId;
//                //    node.nodeData = nodeData.data;
//                //}
//                //node.nodeType = nodeType;
//                if (null != img) {
//                    node.setImage('/statics/img/topology/' + img, false);
//                    node.Image = img;
//                }
//                node.textPosition = textPosition;//设置文字位置
//                node.fontColor = '88,102,110';//设置文字颜色
//                node.setSize(20,20);//设置图标大小
//                //this.EveSetNode(node);
//                this.scene.add(node);
//                return node;
//            },
//            AddLink:function(nodeA,nodeZ,str){
//                var link = new JTopo.Link(nodeA, nodeZ, str);
//                link.lineWidth = 3;//线宽
//                link.bundleGap = 20;//线条之间的间隔
//                link.textOffsetY = 3;//文本偏移量（向下3个像素）
//                //link.arrowsRadius = 10;//箭头大小
//                link.fontColor = '0, 200, 255';//字体颜色
//                if(nodeA.nodeType=='router')
//
//                link.strokeColor = '0, 200, 255';//线条颜色
//                //this.EveSetLink(link);
//                this.scene.add(link);
//                return link;
//            },
//            //绘制动态连线
//            DrawDynamicLink:function(){
//                var that = this;
//                var tempNodeA = new JTopo.Node('tempA');
//                tempNodeA.setSize(1, 1);
//                var tempNodeZ = new JTopo.Node('tempZ');
//                tempNodeZ.setSize(1, 1);
//                var link = new JTopo.Link(tempNodeA, tempNodeZ);
//                var beginNode = that.currentNode;
//                that.scene.add(link);
//                tempNodeA.setLocation(beginNode.x+40, beginNode.y+40);
//                tempNodeZ.setLocation(beginNode.x+40, beginNode.y+40);
//                that.scene.click(function(e){
//                    if(e.button == 2 || !beginNode){
//                        that.scene.remove(link);
//                        return;
//                    }
//                    if(e.target != null && e.target instanceof JTopo.Node){
//                        if(beginNode !== e.target){
//                            var endNode = e.target;
//                            if(that.JudgeLink(beginNode,endNode)) that.AddLink(beginNode,endNode,'');
//                            beginNode = null;
//                            that.scene.remove(link);
//                        }else{
//                            that.scene.remove(link);
//                            beginNode = null;
//                        }
//                    }else{
//                        that.scene.remove(link);
//                        beginNode = null;
//                    }
//                });
//                that.scene.mousedown(function(e){
//                    if(e.target == null || e.target === beginNode || e.target === link){
//                        that.scene.remove(link);
//                        beginNode = null;
//                    }
//                });
//                that.scene.mousemove(function(e){
//                    tempNodeZ.setLocation(e.x, e.y);
//                });
//            },
//        };
//        return NewTopologyService;
//    }]);
//    app.controller('NewTopologyCtrl', ['$scope', '$rootScope', '$stateParams', '$state','NewTopologyService', 'httpLoad',
//        function ($scope, $rootScope, $stateParams, $state, NewTopologyService, httpLoad) {
//            $rootScope.moduleTitle = '监控管理 > 数据纵览';//定义当前页
//            $rootScope.link = '/statics/css/task.css';
//            var task = new NewTopologyService();
//            //获取设备数据
//            var getDeviceData = function(){
//                httpLoad.loadData({
//                    url: '/snmp/device',
//                    data:{
//                        params:JSON.stringify([{"param":{"kind":"TEMPLATE"},"sign":"EQ"}]),
//                        simple:true
//                    },
//                    noParam: true,
//                    success:function(data){
//                        if(data.success){
//                            $scope.deviceData = data.data.rows;
//                            //$scope.routerData = [];$scope.switchData = [];$scope.otherData = [];
//                            //angular.forEach($scope.deviceData, function(data1,index1){
//                            //    switch(data1.type) {
//                            //        case 'router':
//                            //            $scope.routerData.push({uuid:data1.uuid,sysName:data1.sysName,type:data1.type,routerItems:[],switchItems:[],otherItems:[]});
//                            //            break;
//                            //        case 'switch':
//                            //            $scope.switchData.push({uuid:data1.uuid,sysName:data1.sysName,type:data1.type,routerItems:[],switchItems:[],otherItems:[]});
//                            //            break;
//                            //        case 'other':
//                            //            $scope.otherData.push({uuid:data1.uuid,sysName:data1.sysName,type:data1.type,routerItems:[],switchItems:[],otherItems:[]});
//                            //            break;
//                            //    }
//                            //});
//                            getConnectData();
//                        }
//                    }
//                });
//            };
//            getDeviceData();
//            //获取设备连接数据
//            var getConnectData = function(){
//                httpLoad.loadData({
//                    url: '/snmp/connect',
//                    data:{
//                        params:JSON.stringify([{"param":{"kind":"TEMPLATE"},"sign":"EQ"}]),
//                        simple:true
//                    },
//                    noParam: true,
//                    success:function(data){
//                        if(data.success){
//                            $scope.connectData = data.data;
//                            //angular.forEach($scope.routerData, function(data1,index1){
//                            //    angular.forEach($scope.connectData, function(data2,index2){
//                            //        if(data1.uuid==data2.leftUuid){
//                            //            if(data2.type=='router') data1.routerItems.push(data2.rightUuid);
//                            //            if(data2.type=='switch') data1.switchItems.push(data2.rightUuid);
//                            //            if(data2.type=='other') data1.otherItems.push(data2.rightUuid);
//                            //        }else if(data1.uuid==data2.rightUuid){
//                            //            if(data2.type=='router') data1.routerItems.push(data2.leftUuid);
//                            //            if(data2.type=='switch') data1.switchItems.push(data2.leftUuid);
//                            //            if(data2.type=='other') data1.otherItems.push(data2.leftUuid);
//                            //        }
//                            //    });
//                            //});
//                            //angular.forEach($scope.switchData, function(data1,index1){
//                            //    angular.forEach($scope.connectData, function(data2,index2){
//                            //        if(data1.uuid==data2.leftUuid){
//                            //            if(data2.type=='router') data1.routerItems.push(data2.rightUuid);
//                            //            if(data2.type=='switch') data1.switchItems.push(data2.rightUuid);
//                            //            if(data2.type=='other') data1.otherItems.push(data2.rightUuid);
//                            //        }else if(data1.uuid==data2.rightUuid){
//                            //            if(data2.type=='router') data1.routerItems.push(data2.leftUuid);
//                            //            if(data2.type=='switch') data1.switchItems.push(data2.leftUuid);
//                            //            if(data2.type=='other') data1.otherItems.push(data2.leftUuid);
//                            //        }
//                            //    });
//                            //});
//                            //angular.forEach($scope.otherData, function(data1,index1){
//                            //    angular.forEach($scope.connectData, function(data2,index2){
//                            //        if(data1.uuid==data2.leftUuid){
//                            //            if(data2.type=='router') data1.routerItems.push(data2.rightUuid);
//                            //            if(data2.type=='switch') data1.switchItems.push(data2.rightUuid);
//                            //            if(data2.type=='other') data1.otherItems.push(data2.rightUuid);
//                            //        }else if(data1.uuid==data2.rightUuid){
//                            //            if(data2.type=='router') data1.routerItems.push(data2.leftUuid);
//                            //            if(data2.type=='switch') data1.switchItems.push(data2.leftUuid);
//                            //            if(data2.type=='other') data1.otherItems.push(data2.leftUuid);
//                            //        }
//                            //    });
//                            //});
//
//                            task.DrawNode($scope.deviceData,$scope.connectData);
//                        }
//                    }
//                });
//            };
//        }
//    ]);
//})();
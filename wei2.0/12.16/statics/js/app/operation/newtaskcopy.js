/**
 * Created by Zhang Haijun on 2016/11/17.
 */
(function () {
	app.factory('NewTaskService',['$rootScope','httpLoad','$modal', '$timeout', '$stateParams',	function ($rootScope, httpLoad, $modal, $timeout, $stateParams) {
		var NewTaskService = function () {
			this.Init();
		}
		NewTaskService.prototype = {
			Init:function(){
				//初始化内容
				this.InitContent();
				this.InitTab();
				this.DrawStartNode();
				//事件绑定
				this.EveSet();
			},
			InitContent:function(){
				this.scene = new JTopo.Scene();
				this.scene.background = '/statics/img/topology/bg.jpg';
				var canvas = document.getElementById('canvas');
				canvas.height = window.innerHeight * 0.7;
				canvas.width = window.innerWidth * 0.80;
				this.stage = new JTopo.Stage(canvas);
				this.stage.eagleEye.visible = true;
				this.stage.add(this.scene);
				this.ShowJTopoToolBar(this.stage);
			},
			InitTab:function(){
				var data = [{
					"nodeType": "SCRIPT",
					"Image": "script_normal.png",
					"text": "脚本执行"
				}, {
					"nodeType": "FILE",
					"Image": "file_normal.png",
					"text": "文件分发"
				}, {
					"nodeType": "BACKUP",
					"Image": "backup_normal.png",
					"text": "创建备份"
				}];
				if($stateParams.flag == 4 || $stateParams.flag == 5 || $stateParams.flag == 6){
					data = [{
						"nodeType": "BACKUP",
						"Image": "backup_normal.png",
						"text": "创建备份"
					}];
				}
				var html = [];
				data.forEach(function (item) {
					html.push('<div  class="item" type="'+item.nodeType+'" image="'+item.Image+'">');
					html.push('<img class="node-img" src="/statics/img/topology/'+item.Image+'" />');
					html.push('<span>'+item.text+'</span></div>');
				});
				$('.task-tab').html(html.join(''));
			},
			//工具栏
			ShowJTopoToolBar:function(stage){
				stage.mode = 'edit';
				var that = this;
				var toobarDiv = $('<div class="jtopo_toolbar">').html(''
					// +'<label class="i-checks i-checks-sm m-r-xs"> <input type="radio" name="modeRadio" value="normal" checked id="r1"><i></i>默认</label>'
					// +'<label class="i-checks i-checks-sm m-r-xs"> <input type="radio" name="modeRadio" value="select" id="r2"><i></i>框选</label>'
					// +'<label class="i-checks i-checks-sm m-r-xs"> <input type="radio" name="modeRadio" value="drag" id="r3"><i></i>平移</label>'
					// +'<label class="i-checks i-checks-sm m-r-md"> <input type="radio" name="modeRadio" value="edit" id="r4"><i></i>编辑</label>'
					+'<input type="text" id="findText" class="form-control" value="" onkeydown="findButton.click()" style="display: inline-block;width: 200px;height: 26px">'
					+'<button class="btn m-b-xs btn-xs btn-primary m-l-xs m-t-xs" id="findButton"><i class="icon-magnifier"></i> 查 询</button>'
					+'<button class="btn btn-xs btn-success pull-right m-t-xs" id="exportButton"><i class="fa fa-floppy-o"></i> 导出PNG</button>'
					+'<button class="btn btn-xs btn-info m-r-xs pull-right m-t-xs"  id="fullScreenButton"><i class="icon-size-fullscreen"></i> 全 屏</button>'
					+'<button class="btn btn-xs btn-primary m-r-xs pull-right m-t-xs"  id="centerButton"><i class="fa fa-align-center"></i> 居 中</button>'
					+'<button class="btn btn-xs btn-success m-r-xs pull-right m-t-xs"  id="zoomOutButton"><i class="icon-magnifier-add"></i>  放 大</button>'
					+'<button class="btn btn-xs btn-danger m-r-xs pull-right m-t-xs"  id="zoomInButton"><i class="icon-magnifier-remove"></i>  缩 小</button>'
					+'<label class="i-checks i-checks-sm m-r m-t-xs pull-right" ><input type="checkbox" id="zoomCheckbox" ><i></i>鼠标缩放</label>'
				);
				$('#content').prepend(toobarDiv);
				
				// 工具栏按钮处理
				// $("input[name='modeRadio']").click(function(){
				// 	stage.mode = $("input[name='modeRadio']:checked").val();
				// 	console.log(that.stage.mode);
				// });
				$('#centerButton').click(function(){
					stage.centerAndZoom(); //缩放并居中显示
				});
				$('#zoomOutButton').click(function(){
					stage.zoomOut();
				});
				$('#zoomInButton').click(function(){
					stage.zoomIn();
				});
				$('#exportButton').click(function(){
					stage.saveImageInfo();
				});
				$('#zoomCheckbox').click(function(){
					$(this).toggleClass('checked');
					if($('#zoomCheckbox').hasClass('checked')){
						stage.wheelZoom = 1.15; // 设置鼠标缩放比例
					}else{
						stage.wheelZoom = null; // 取消鼠标缩放比例
					}
				});
				$('#fullScreenButton').click(function(){
					runPrefixMethod(stage.canvas, "RequestFullScreen")
				});
				// 查询
				$('#findButton').click(function(){
					var text = $('#findText').val().trim();
					var nodes = stage.find('node[text="'+text+'"]');
					if(nodes.length > 0){
						var node = nodes[0];
						node.selected = true;
						var location = node.getCenterLocation();
						// 查询到的节点居中显示
						stage.setCenter(location.x, location.y);
						function nodeFlash(node, n){
							if(n == 0) {
								node.selected = false;
								return;
							};
							node.selected = !node.selected;
							setTimeout(function(){
								nodeFlash(node, n-1);
							}, 300);
						}
						// 闪烁几下
						nodeFlash(node, 6);
					}
				});
			},
			//绘制开始结束节点
			DrawStartNode:function(){
				var that = this;
				var nodeData = [{
					x:80,
					y:120,
					text:'开始节点',
					type:'START',
					img:'start_normal.png'
				},{
					x:650,
					y:120,
					text:'结束节点',
					type:'END',
					img:'end_normal.png'
				}];
				nodeData.forEach(function (item) {
					that.AddNode(item.x,item.y,item.text,item.img,'Bottom_Center',item.type);
				});
			},
			//初始绘制节点
			DrawNode:function(data){
				var that = this;
				//清除节点数据
				that.scene.clear();
				var img = {
					START:'start_normal.png',
					END:'end_normal.png',
					SCRIPT:'script_normal.png',
					FILE:'file_normal.png',
					BACKUP:'backup_normal.png'
				}
				data.nodes.forEach(function(item){
					if(item.start){
						that.AddNode(item.location.x,item.location.y,'开始节点',img.START,'Bottom_Center','START',item);
					}else	if(item.end){
						that.AddNode(item.location.x,item.location.y,'结束节点',img.END,'Bottom_Center','END',item);
					}else {
						that.AddNode(item.location.x,item.location.y,item.data.name,img[item.data.type],'Bottom_Center',item.data.type,item);
					}
				});
				data.links.forEach(function (item) {
						var nodeA = that.scene.findElements(function (e) {
							return e.id == item.nodeAid;
						});
					var nodeZ = that.scene.findElements(function (e) {
						return e.id == item.nodeZid;
					});
					if (nodeA[0] && nodeZ[0]) {
						that.AddLink(nodeA[0], nodeZ[0], item.text);
					}
				});
			},
			//组合数据
			FormatData:function(){
				var data = this.scene.childs;
				var nodes = [], links = [] ;
				var judgeNode = function(item){
					item.inLinks = item.inLinks || [];item.outLinks = item.outLinks || [];
					var nodeFlash = function(item,text,n){
						if(n == 0){
							item.alarm = null;
							return;
						}
						if(item.alarm){
							item.alarm = null;
						}else{
							item.alarm = text;
						}
						setTimeout(function(){
							nodeFlash(item,text,n-1)
						},600)
					};
					if(item.nodeType == 'START'){
						if(item.inLinks.length > 0 || item.outLinks.length == 0){
							$rootScope.pop('请确保【开始节点】入度为0，出度不为0','error');
							nodeFlash(item,'有误',8)
							return false;
						}
					}else if(item.nodeType == 'END'){
						if(item.inLinks.length == 0 || item.outLinks.length > 0){
							$rootScope.pop('请确保【结束节点】入度不为0，出度为0','error');
							nodeFlash(item,'有误',8)
							return false;
						}
					}else{
						if(item.inLinks.length == 0 || item.outLinks.length == 0){
							$rootScope.pop('请确保【普通节点】的入度、出度均不为0','error');
							nodeFlash(item,'有误',8)
							return false;
						}else if(!item.nodeData){
							$rootScope.pop('请填写节点数据','error');
							item.alarm = '必填';
							return false;
						}else if($stateParams.flag == 1 && item.nodeData&&item.nodeData.targets.length ==0){//模板创建目标机器的验证
							$rootScope.pop('请选择目标机器','error');
							item.alarm = '必填';
							return false;
						}
					};
					return true;
				}
				for(var i in data){
					var item = data[i];
					if(item.elementType == 'node'){
						if(!judgeNode(item)) 		return false;
						var obj = {
							nodeId:item.id,
							location:{
								x:item.x,
								y:item.y
							},
							data:item.nodeData,
							start:item.nodeType == 'START' ? true : false,
							end:item.nodeType == 'END' ? true : false,
						};
						nodes.push(obj);
					}else if(item.elementType == 'link'){
						var obj = {
							nodeAid: item.nodeA.id,
							nodeZid: item.nodeZ.id
						};
						links.push(obj);
					}
				}
				return {nodes:nodes,links:links}
			},
			//对连线进行判断
			JudgeLink:function(beginNode,endNode){
				var data = this.scene.childs;
				var flag = true;
				for(var i in data){
					var item = data[i];
					if(item.elementType == 'link'){
						if((beginNode.id == item.nodeA.id && endNode.id == item.nodeZ.id) || (beginNode.id == item.nodeZ.id && endNode.id == item.nodeA.id)){
							flag = false;
							return false;
						}
					}
				};
				return flag;
			},
			//添加节点
			AddNode:function(x, y, str, img, textPosition, nodeType, nodeData){
				var node = new JTopo.Node(str);
				node.setLocation(x, y);
				node.id = new Date().getTime() + x;
				if(nodeData){
					node.id = nodeData.nodeId;
					node.nodeData = nodeData.data;
				}
				node.nodeType = nodeType;
				if (null != img) {
					node.setImage('/statics/img/topology/' + img, false);
					node.Image = img;
				}
				node.textPosition = textPosition;//设置文字位置
				node.fontColor = '88,102,110';//设置文字颜色
				node.setSize(80,80);//设置图标大小
				this.EveSetNode(node);
				this.scene.add(node);
				return node;
			},
			//打开编辑模态框
			OpenEditModal:function (node) {
				node.alarm = null;
				switch(node.nodeType){
					case 'SCRIPT':
						this.AddScriptNode(node);
						break;
					case 'FILE':
						this.AddFileNode(node);
						break;
					case 'BACKUP':
						this.AddBackupNode(node);
						break;
				}
			},
			//添加连线
			AddLink:function(nodeA,nodeZ,str){
				var link = new JTopo.Link(nodeA, nodeZ, str);
				link.lineWidth = 3;//线宽
				link.bundleGap = 20;//线条之间的间隔
				link.textOffsetY = 3;//文本偏移量（向下3个像素）
				link.arrowsRadius = 10;//箭头大小
				link.fontColor = '0, 200, 255';//字体颜色
				link.strokeColor = '0, 200, 255';//线条颜色
				this.EveSetLink(link);
				this.scene.add(link);
			},
			//添加脚本节点
			AddScriptNode:function(node){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtaskcopy/scriptModal.html',
					controller: 'addScriptTaskModalCtrl',
					backdrop: 'static',
					size: 'lg',
					resolve: {
						node: function () {
							return angular.toJson(node.nodeData);
						}
					}
				});
				modalInstance.result.then(function (data) {
					node.nodeData = data;
					node.text = data.name;
				});
			},
			//添加文件节点
			AddFileNode:function (node) {
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtaskcopy/fileModal.html',
					controller: 'addFileTaskModalCtrl',
					backdrop: 'static',
					size: 'lg',
					resolve: {
						node: function () {
							return angular.toJson(node.nodeData);
						}
					}
				});
				modalInstance.result.then(function (data) {
					node.nodeData = data;
					node.text = data.name;
				});
			},
			//添加备份节点
			AddBackupNode:function (node) {
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtaskcopy/backupModal.html',
					controller: 'addBackupTaskModalCtrl',
					backdrop: 'static',
					size: 'lg',
					resolve: {
						node: function () {
							return angular.toJson(node.nodeData);
						}
					}
				});
				modalInstance.result.then(function (data) {
					node.nodeData = data;
					node.text = data.name;
				});
			},
			//绘制动态连线
			DrawDynamicLink:function(){
				var that = this;
				var tempNodeA = new JTopo.Node('tempA');
				tempNodeA.setSize(1, 1);
				var tempNodeZ = new JTopo.Node('tempZ');
				tempNodeZ.setSize(1, 1);
				var link = new JTopo.Link(tempNodeA, tempNodeZ);
				var beginNode = that.currentNode;
				that.scene.add(link);
				tempNodeA.setLocation(beginNode.x+40, beginNode.y+40);
				tempNodeZ.setLocation(beginNode.x+40, beginNode.y+40);
				that.scene.click(function(e){
					if(e.button == 2 || !beginNode){
						that.scene.remove(link);
						return;
					}
					if(e.target != null && e.target instanceof JTopo.Node){
						if(beginNode !== e.target){
							var endNode = e.target;
							if(that.JudgeLink(beginNode,endNode)) that.AddLink(beginNode,endNode,'');
							beginNode = null;
							that.scene.remove(link);
						}else{
							that.scene.remove(link);
							 beginNode = null;
						}
					}else{
						that.scene.remove(link);
						beginNode = null;
					}
				});
				that.scene.mousedown(function(e){
					if(e.target == null || e.target === beginNode || e.target === link){
						that.scene.remove(link);
						beginNode = null;
					}
				});
				that.scene.mousemove(function(e){
						tempNodeZ.setLocation(e.x, e.y);
				});
			},
			//对内容节点的操作
			EveSetNode:function(node){
				var that = this;
				//鼠标释放
				node.addEventListener('mouseup', function (event) {
					$(".node-menu").hide();
					if (event.button == 2) {//右键
						if(node.nodeType == 'START' || node.nodeType == 'END'){
							$("#contextmenustart").css({
								top: event.offsetY +170,
								left: event.offsetX + 20
							}).show();
						}else{
							$("#contextmenu").css({
								top: event.offsetY +170,
								left: event.offsetX + 20
							}).show();
						}
						that.currentNode = node;
					}
				});
				//双击
				node.addEventListener('dbclick', function (event) {
					that.OpenEditModal(node);
				});
			},
			//对连线的操作
			EveSetLink:function(link){
				var that = this;
				link.addEventListener('mouseup', function (event) {
					$(".node-menu").hide();
					if (event.button == 2) {//右键
						$("#linkmenu").css({
							top: event.offsetY +170,
							left: event.offsetX + 20
						}).show();
						that.currentLink = link;
					}
				});
			},
			//右键菜单
			EveSet:function(){
				var that = this;
				//删除节点
				var delNode = function (flag,node) {
					var modalInstance = $modal.open({
						templateUrl: '/statics/tpl/operation/newtask/delModal.html',
						controller: 'delModalCtrl',
						backdrop: 'static',
						resolve:{
							tip: function () {
								return '你确定要删除该元素吗？';
							},
							btnList: function () {
								return  [{name:'删除',type:'btn-danger'},{name:'取消',type:'btn-default'}];
							}
						}
					});
					modalInstance.result.then(function() {
						that.scene.remove(node);
						node = null;
					});
				};
				$("#contextmenu a,#contextmenustart a").on('click',function (e) {
					var tip = $(this).attr('tip');
					switch(tip/1){
						case 1:
							that.OpenEditModal(that.currentNode);
							break;
						case 2:
							that.currentNode.rotate += 0.5;
							break;
						case 3:
							that.currentNode.rotate -= 0.5;
							break;
						case 4:
							delNode(1,that.currentNode);
							break;
						case 5:
							$("node-menu").hide();
							break;
						case 6:
							that.DrawDynamicLink();
							break;
					}
					$(".node-menu").hide();
				});
				$("#linkmenu a").on('click',function () {
					var tip = $(this).attr('tip');
					switch(tip/1){
						case 1:
							delNode(2,that.currentLink);
							break;
						case 2:
							$("#linkmenu").hide();
							break;
					}
					$("#linkmenu").hide();
				});
				$('.task-content').on('click',function (event) {
					event.stopPropagation();
					$("#contextmenu,#linkmenu").hide();
				});
				var _target;
				//拖拽效果
				$('.task-tab>div.item').draggable({
					start: function(){
						_target = $(this);
					},
					stop: function(){
						var _dragIcon = _target.find('.node-img');
						_dragIcon.animate({width:0,height:1,opacity: 0},100,function(){
							_target.attr('style','position: relative;');
							_dragIcon.removeAttr('style');
						});
					}
				});
				$('#content').droppable({
					drop:function(e){
						var offset = $('#canvas').offset();
						var x = e.pageX - offset.left - 40;
						var y = e.pageY - offset.top - 40;
							that.AddNode(x,y,'新建节点',_target.attr('image'),'Bottom_Center',_target.attr('type'));
					}
				});
			}
		};
		return NewTaskService;
	}]);
	app.controller('NewTaskCopyCtrl', ['$scope', '$rootScope', '$stateParams', '$state','NewTaskService', 'httpLoad',
		function ($scope, $rootScope, $stateParams, $state, NewTaskService, httpLoad) {
			$rootScope.moduleTitle = '运维中心 > 新建作业';//定义当前页
			$rootScope.link = '/statics/css/task.css';//引入页面样式
			var task = new NewTaskService();
			var 	getDataUrl,saveUrl;
			//获取模板列表
			var getTplList = function(){
				httpLoad.loadData({
					url: '/task/graph/list',
					data:{
						params:JSON.stringify([{"param":{"kind":"TEMPLATE"},"sign":"EQ"}]),
						simple:true
					},
					noParam: true,
					success:function(data){
						if(data.success){
							$scope.tplListData = data.data.rows;
						}
					}
				})
			};
			$scope.selectTpl = function(){
				if($scope.tplId) {
					angular.element('.step-content').empty();
					getEditData($scope.tplId);
				};
			};
			//获取编辑数据
			var getEditData = function(id){
				//对编辑数据进行处理回现
				httpLoad.loadData({
					url: getDataUrl,
					data:{id:id || $scope.taskId},
					method:'GET',
					success:function(data){
						if(data.success){
							var data = data.data;
							if('25711'.indexOf($stateParams.flag) > -1) $scope.name = data.name;
							$scope.remark = data.remark;
							task.DrawNode(angular.fromJson(data.graph));
						}
					}
				})
			};
			(function(){
				switch($stateParams.flag/1){
					case 1:
						$rootScope.moduleTitle = '日常作业 > 新建作业';
						$scope.showTpl = true;
						$scope.kind = 'GENERAl';getTplList();
						getDataUrl = '/task/graph/clone';saveUrl = '/task/graph/create';
						$scope.pageGo = 'app.operation.tasklist';
						break;
					case 2:
						$rootScope.moduleTitle = '日常作业 > 修改作业';
						$scope.kind = 'GENERAl';
						getDataUrl = '/task/graph/detail';saveUrl = '/task/graph/modify';
						$scope.taskId= $stateParams.id;
						$scope.pageGo = 'app.operation.tasklist';
						getEditData();
						break;
					case 3:
						$rootScope.moduleTitle = '日常作业 > 作业克隆';
						$scope.kind = 'GENERAl';
						getDataUrl = '/task/graph/clone';saveUrl = '/task/graph/create';
						$scope.pageGo = 'app.operation.tasklist';
						getEditData($stateParams.id);
						break;
					case 4:
						$rootScope.moduleTitle = '日常作业 > 新建备份作业';
						$scope.kind = 'BACKUP';
						$scope.hideFun = true;
						saveUrl = '/task/graph/create';
						$scope.pageGo = 'app.operation.backupRecovery';
						break;
					case 5:
						$rootScope.moduleTitle = '日常作业 > 修改备份作业';
						$scope.kind = 'BACKUP';
						$scope.hideFun = true;
						getDataUrl = '/task/graph/detail';saveUrl = '/task/graph/modify';
						$scope.taskId= $stateParams.id;
						$scope.pageGo = 'app.operation.backupRecovery';
						getEditData();
						break
					case 6:
						$rootScope.moduleTitle = '日常作业 > 备份作业克隆';
						$scope.kind = 'BACKUP';
						$scope.hideFun = true;
						getDataUrl = '/task/graph/clone';saveUrl = '/task/graph/create';
						$scope.pageGo = 'app.operation.backupRecovery';
						getEditData($stateParams.id);
						break;
					case 7:
						$rootScope.moduleTitle = '应用中心 > 简单部署';
						$scope.kind = 'GENERAl';
						var ids =  $stateParams.id.split('$');
						$scope.appId= ids[0];	var id = ids[1];
						getDataUrl = '/task/graph/clone';saveUrl = '/app/execute';
						$scope.isHideSave = true;
						$scope.pageGo = 'app.application.deploy';
						getEditData(id);
						break;
					case 8:
						$rootScope.moduleTitle = '应用中心 > 部署应用';
						$scope.kind = 'GENERAl';
						$scope.appId= $stateParams.id;
						getDataUrl = '/task/graph/clone';saveUrl = '/app/deploy/create';
						$scope.isHideExecute = true;
						$scope.pageGo = 'app.application.deploy';
						break;
					case 9:
						$rootScope.moduleTitle = '应用中心 > 部署编辑';
						$scope.kind = 'GENERAl';
						var ids =  $stateParams.id.split('$');
						$scope.appId= ids[0];	$scope.taskId= ids[1];
						getDataUrl = '/task/graph/detail';saveUrl = '/task/graph/modify';
						$scope.isHideExecute = true;
						$scope.pageGo = 'app.application.deploy';
						getEditData();
						break;
					case 10:
						$rootScope.moduleTitle = '日常作业 > 新增模板';
						$scope.kind = 'TEMPLATE';$scope.isTpl = true;
						saveUrl = '/task/graph/create';
						$scope.isHideExecute = true;
						$scope.pageGo = 'app.operation.tasktpl';
						break;
					case 11:
						$rootScope.moduleTitle = '日常作业 > 修改模板';
						$scope.kind = 'TEMPLATE';$scope.isTpl = true;
						getDataUrl = '/task/graph/detail';saveUrl = '/task/graph/modify';
						$scope.taskId= $stateParams.id;
						$scope.isHideExecute = true;
						$scope.pageGo = 'app.operation.tasktpl';
						getEditData();
						break;
				}
			})();
			$scope.goList = function(){
				$state.go($scope.pageGo)
			};
			$scope.execute = function(flag){
				var postData = task.FormatData();
				if(!postData) return;
				var data = {
					name: $scope.name,
					remark:$scope.remark,
					type: "REAL",
					kind: $scope.kind,
					graph:postData
				};
				if($scope.taskId) data.id = $scope.taskId;
				if($scope.appId) data.appId = $scope.appId;
				httpLoad.loadData({
					url: saveUrl,
					data:data,
					method:'POST',
					success:function(data){
						if(data.success){
							if(flag){
								$state.go($scope.pageGo);
							}else{//部署应用直接跳到详情
								if($scope.isHideSave) $scope.goTaskDetail(data.data);
								else $scope.goPreviewTask($scope.taskId || data.data.id);//区分编辑和创建传递id的方式
							}
						}
					}
				})
			};
		}
	]);
	app.controller('addScriptTaskModalCtrl', ['$scope', '$modalInstance', '$modal', '$stateParams', '$timeout', 'httpLoad',  'node', 'CommonData',
		function ($scope, $modalInstance, $modal, $stateParams, $timeout, httpLoad, node, CommonData) {
		if($stateParams.flag == 10 || $stateParams.flag == 11) $scope.hideTarget = true;
			$scope.itemsByPage = 5;//目标服务器每页显示条数
			node = angular.fromJson(node);
			$scope.identModeData = CommonData.identMode;
			$scope.selectMode = function () {
				if($scope.itemData.identMode=='BATCH'){
					$scope.isExecuteAccount = false;
				}else{
					$scope.itemData.identId = '';
					$scope.isExecuteAccount = true;
				}
				
			};
			if(node){
					$scope.serverListData = node.targets;
					$scope.totalSelect = $scope.serverListData.length;
					$timeout(function(){
						$scope.codeMirror.setValue(node.script.content);
					},100);
				$scope.itemData = node;
				$scope.selectMode();
			}else{
				$scope.serverListData = [];
				$scope.itemData = {
					type:'SCRIPT',
					identMode:'BATCH',
					failover:false,
					suspendable: false,
					timeout:600,
					intervalTime:10,
					retryTime:3,
					script:{
						type:'SHELL'
					}
				};
			}
			//获取脚本内容
			$scope.scriptItem = {};
			$scope.getScriptValue = function(id){
				httpLoad.loadData({
					url:'/script/detail',
					method:'GET',
					data:{
						id:$scope.scriptItem.selected.id
					},
					success:function(data){
						$scope.codeMirror.setValue(data.data.content);
					}
				});
			};
			$scope.source = 1;
			//获取执行账户列表
			(function(){
				httpLoad.loadData({
					url:'/ident/list',
					noParam:true,
					data:{
						simple:true
					},
					success:function(data){
						if(data.success){
							$scope.accountData = data.data.rows;
							for(var a in $scope.accountData){
								var data = $scope.accountData[a];
								data.name = data.username;
								if(data.remark){
									data.name = data.username + '(' + data.remark + ')';
								}
							}
						}
					}
				});
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
			})();
			//选择脚本来源
			$scope.selectSource = function () {
				$scope.source == 1 ? $scope.codeMirror.options.readOnly = false : $scope.codeMirror.options.readOnly = true;
			}
			//获取脚本内容
			$scope.scriptItem = {}
			$scope.getScriptValue = function(){
				httpLoad.loadData({
					url:'/script/detail',
					method:'GET',
					data:{
						id:$scope.scriptItem.selected.id
					},
					success:function(data){
						$scope.codeMirror.setValue(data.data.content);
					}
				});
			}
			//选择本地脚本--timeout解决异步加载问题
			$timeout(function(){
				$('.script-modal').find('.script-file').on('change',function(){
					var data = $(this)[0].files[0];
					//对文件大小和类型进行过滤
					var arr = data.name.split('.');
					if(['txt','sh','py','bat','pl'].indexOf(arr[arr.length-1]) == -1){
						$scope.$apply(function(){
							$scope.pop('请上传脚本类型的文件，【.txt，.sh，.py，.bat，.pl】','error');
						});
						return;
					}
					if(data.size > 1024*1024){
						$scope.$apply(function(){
							$rootScope.pop('文件大小超过1M','error');
						});
						return;
					}
					if (data) {
						//将文件进行转码，转换为text
						var reader = new FileReader();
						reader.readAsText(data);
						reader.onload = function (f) {
							$scope.codeMirror.setValue(this.result);
						}
					}
				});
			});
			//对值做验证
			$scope.validateValue = function(item,def){
				if($scope.itemData[item] < 1) $scope.itemData[item] = def;
			};
			//选择目标服务器
			$scope.selectServer = function(){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/selectServerModal.html',
					controller: 'selectServerModalCtrl',
					backdrop: 'static',
					size:'lg',
					resolve: {
						selectList:function(){
							return angular.toJson($scope.serverListData || []);
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.serverListData = data;
					if(data.length > 0) $scope.isShowServer = true;
					$scope.totalSelect = $scope.serverListData.length;
				});
			};
			//删除选择的服务器
			$scope.delServer = function(key){
				$scope.serverListData.splice(key,1);
				$scope.totalSelect = $scope.serverListData.length;
			};
			//清除所有服务器
			$scope.clearServer = function(){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要清空所选择IP吗？';
						},
						btnList: function () {
							return  [{name:'清空',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.serverListData = [];
					$scope.totalSelect = $scope.serverListData.length;
				});
			}
			//保存按钮
			$scope.ok = function () {
				if($scope.$invalid) return;//表单验证不通过，直接return;
				if(!$scope.itemData.failover){
					$scope.itemData.retryTime = '';
					$scope.itemData.intervalTime = '';
				};
				$scope.itemData.script.content = $scope.codeMirror.getValue();
				$scope.itemData.targets = [];
				$scope.serverListData.forEach(function(data){
					$scope.itemData.targets.push({ip:data.ip,status:data.status,username:data.username,password:data.password});
				});
				$modalInstance.close($scope.itemData);
			}
			$scope.cancle = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	app.controller('addFileTaskModalCtrl', ['$scope', '$modalInstance', '$modal', '$stateParams', '$timeout', 'httpLoad',  'node', 'CommonData',
		function ($scope, $modalInstance, $modal, $stateParams, $timeout, httpLoad, node, CommonData) {
			$scope.itemsByPage = 5;//目标服务器每页显示条数
			node = angular.fromJson(node);
			$scope.identModeData = CommonData.identMode;
			if($stateParams.flag == 10 || $stateParams.flag == 11) $scope.hideTarget = true;
			$scope.selectMode = function () {
				if($scope.itemData.identMode=='BATCH'){
					$scope.isExecuteAccount = false;
				}else{
					$scope.itemData.identId = '';
					$scope.isExecuteAccount = true;
				}
				
			};
			if(node){
				$scope.serverListData = node.targets;
				$scope.totalSelect = $scope.serverListData.length;
				$scope.serverFileListData = node.files
				$scope.itemData = node;
				$scope.selectMode();
			}else{
				$scope.serverListData = [];
				$scope.itemData = {
					type:'FILE',
					identMode:'BATCH',
					suspendable: false,
					failover:false,
					timeout:600,
					intervalTime:10,
					retryTime:3
				};
			}
			$scope.files = [];
			//获取执行账户列表
			(function(){
				httpLoad.loadData({
					url:'/ident/list',
					noParam:true,
					data:{
						simple:true
					},
					success:function(data){
						if(data.success){
							$scope.accountData = data.data.rows;
							for(var a in $scope.accountData){
								var data = $scope.accountData[a];
								data.name = data.username;
								if(data.remark){
									data.name = data.username + '(' + data.remark + ')';
								}
							}
						}
					}
				});
			})();
			//添加服务器文件
			$scope.addServerFile = function () {
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/selectServerFileModal.html',
					controller: 'selectServerFileModalCtrl',
					backdrop: 'static',
					resolve: {}
				});
				modalInstance.result.then(function (data) {
					$scope.serverFileListData = data;
				});
			}
			//删除服务器文件
			$scope.removeServerFile = function (flag,key) {
				if(flag == 1) $scope.uploaderList.splice(key,1);
				else $scope.serverFileListData.splice(key,1);
			}
			//对值做验证
			$scope.validateValue = function(item,def){
				if($scope.itemData[item] < 1) $scope.itemData[item] = def;
			};
			//选择目标服务器
			$scope.selectServer = function(){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/selectServerModal.html',
					controller: 'selectServerModalCtrl',
					backdrop: 'static',
					size:'lg',
					resolve: {
						selectList:function(){
							return angular.toJson($scope.serverListData || []);
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.serverListData = data;
					if(data.length > 0) $scope.isShowServer = true;
					$scope.totalSelect = $scope.serverListData.length;
				});
			};
			//删除选择的服务器
			$scope.delServer = function(key){
				$scope.serverListData.splice(key,1);
				$scope.totalSelect = $scope.serverListData.length;
			};
			//清除所有服务器
			$scope.clearServer = function(){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要清空所选择IP吗？';
						},
						btnList: function () {
							return  [{name:'清空',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.serverListData = [];
					$scope.totalSelect = $scope.serverListData.length;
				});
			}
			//保存按钮
			$scope.ok = function () {
				if($scope.$invalid) return;//表单验证不通过，直接return;
				if(!$scope.itemData.failover){
					$scope.itemData.retryTime = '';
					$scope.itemData.intervalTime = '';
				};
				$scope.itemData.targets = [];
				$scope.serverListData.forEach(function (data) {
					$scope.itemData.targets.push({ip:data.ip,status:data.status,username:data.username,password:data.password});
				});
				$scope.itemData.files = [];
				$scope.uploaderList.forEach(function (data) {
					var obj = data.data;
					if(obj) $scope.itemData.files.push({name:obj.name,fileId:obj.id,path:obj.path})
				});
				($scope.serverFileListData||[]).forEach(function (obj) {
					$scope.itemData.files.push({name:obj.name,fileId:obj.fileId || obj.id,path:obj.path});
				});
				$modalInstance.close($scope.itemData);
			}
			$scope.cancle = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	app.controller('addBackupTaskModalCtrl', ['$scope', '$modalInstance', '$modal', '$stateParams', '$timeout', 'httpLoad',  'node', 'CommonData',
		function ($scope, $modalInstance, $modal, $stateParams, $timeout, httpLoad, node, CommonData) {
			$scope.itemsByPage = 5;//目标服务器每页显示条数
			node = angular.fromJson(node);
			$scope.identModeData = CommonData.identMode;
			if($stateParams.flag == 10 || $stateParams.flag == 11) $scope.hideTarget = true;
			$scope.selectMode = function () {
				if($scope.itemData.identMode=='BATCH'){
					$scope.isExecuteAccount = false;
				}else{
					$scope.itemData.identId = '';
					$scope.isExecuteAccount = true;
				}
			};
			if(node){
				$scope.serverListData = node.targets;
				$scope.totalSelect = $scope.serverListData.length;
				$scope.serverFileListData = node.files
				$scope.itemData = node;
				$scope.selectMode();
			}else{
				$scope.serverListData = [];
				$scope.itemData = {
					identMode:'BATCH',
					type:'BACKUP',
					failover:false,
					timeout:600,
					intervalTime:10,
					retryTime:3
				};
			};
			//获取执行账户列表
			(function(){
				httpLoad.loadData({
					url:'/ident/list',
					noParam:true,
					data:{
						simple:true
					},
					success:function(data){
						if(data.success){
							$scope.accountData = data.data.rows;
							for(var a in $scope.accountData){
								var data = $scope.accountData[a];
								data.name = data.username;
								if(data.remark){
									data.name = data.username + '(' + data.remark + ')';
								}
							}
						}
					}
				});
			})();
			//对值做验证
			$scope.validateValue = function(item,def){
				if($scope.itemData[item] < 1) $scope.itemData[item] = def;
			};
			//选择目标服务器
			$scope.selectServer = function(){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/selectServerModal.html',
					controller: 'selectServerModalCtrl',
					backdrop: 'static',
					size:'lg',
					resolve: {
						selectList:function(){
							return angular.toJson($scope.serverListData || []);
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.serverListData = data;
					if(data.length > 0) $scope.isShowServer = true;
					$scope.totalSelect = $scope.serverListData.length;
				});
			};
			//删除选择的服务器
			$scope.delServer = function(key){
				$scope.serverListData.splice(key,1);
				$scope.totalSelect = $scope.serverListData.length;
			};
			//清除所有服务器
			$scope.clearServer = function(){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/newtask/delModal.html',
					controller: 'delModalCtrl',
					backdrop: 'static',
					resolve:{
						tip: function () {
							return '你确定要清空所选择IP吗？';
						},
						btnList: function () {
							return  [{name:'清空',type:'btn-danger'},{name:'取消',type:'btn-default'}];
						}
					}
				});
				modalInstance.result.then(function (data) {
					$scope.serverListData = [];
					$scope.totalSelect = $scope.serverListData.length;
				});
			}
			//保存按钮
			$scope.ok = function () {
				if($scope.$invalid) return;//表单验证不通过，直接return;
				if(!$scope.itemData.failover){
					$scope.itemData.retryTime = '';
					$scope.itemData.intervalTime = '';
				};
				$scope.itemData.targets = [];
				$scope.serverListData.forEach(function (data) {
					$scope.itemData.targets.push({ip:data.ip,status:data.status,username:data.username,password:data.password});
				});
				$modalInstance.close($scope.itemData);
			}
			$scope.cancle = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	]);
})();
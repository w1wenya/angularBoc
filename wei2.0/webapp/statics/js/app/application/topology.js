/**
 * Created by Zhang Haijun on 2016/10/8.
 */
app.controller('TopologyEditCtrl', ['$scope', 'httpLoad', '$rootScope','$modal',
	function($scope, httpLoad, $rootScope, $modal) {
		$rootScope.moduleTitle = '应用中心 > 拓扑编辑';//定义当前页
		$rootScope.link = '/statics/css/topology.css';//引入页面样式
		var ORDER = {
			tools: {},
			'index':'',
			'loadding':true,
		};
		var scene = new JTopo.Scene();
		$('#toJson').on('click',function(){
			tJson();
		});
		function tJson(){
			var a = scene;
			for(var b=0;b< a.childs.length;b++){
				var k = a.childs[b];
				if(k.elementType == 'node'){
					k.id = k.x* k.y;
				}
			}
			var d="[";
			//d+='"scene":[';
			for(var e=0;e< a.childs.length;e++){
				var f= a.childs[e];
				d+="{";
				if(f.elementType == 'node')
				{
					d += "\"elementType\":"+ '"'+f.elementType+'"';
					d += ",\"x\":"+ f.x;
					d += ",\"y\":"+ f.y;
					d += ",\"id\":"+ f.id;
					d += ",\"Image\":"+ '"'+ f.Image+ '"';
					d += ",\"text\":"+ '"'+ f.text+ '"';
					d +=",\"textPosition\":"+ '"'+ f.textPosition+ '"';
					d +=',"level":'+ f.level;
				}else if(f.elementType == 'link'){
					d += "\"elementType\":"+ '"'+ f.elementType+ '"';
					d += ",\"nodeAid\":"+ f.nodeA.id;
					d += ",\"nodeZid\":"+ f.nodeZ.id;
					d += ",\"text\":"+ '"'+ f.text+ '"';
					d +=",\"fontColor\":"+ '"'+ f.fontColor+ '"';
				}
				d+="},"
			}
			d= d.substring(0, d.length-1);
			d +="]";
			var w=window.open('','','top=10000,left=10000');
			w.document.write(d);
			
			w.document.execCommand('Saveas',false,'a.txt');
			
			w.close();
			console.log(d)
		}
		(function($,window){
//orderLosd.js
			(function(self, $){
				var tools = ORDER.tools,
					orderLosd;
				var canvas = document.getElementById('canvas');
				canvas.height = window.innerHeight * 0.7;
				canvas.width = window.innerWidth * 0.80;
					scene.background = '/statics/img/topology/bg.jpg';
				var stage = new JTopo.Stage(canvas);
				stage.eagleEye.visible = true;
				showJTopoToobar(stage);
				var currentNode = null;
				var endNode = null;
				var tmpx = null;
				var tmpy = null;
				var jsonObj = [{
					"elementType": "node",
					"x": 370,
					"y": 121,
					"id": 44770,
					"Image": "5200.jpg",
					"text": "新建节点",
					"textPosition": "Bottom_Center",
					"level": 4
				}, {
					"elementType": "node",
					"x": 375,
					"y": 295,
					"id": 110625,
					"Image": "ER16.jpg",
					"text": "新建节点",
					"textPosition": "Bottom_Center",
					"level": 3
				}, {
					"elementType": "node",
					"x": 214,
					"y": 127,
					"id": 27178,
					"Image": "8000.jpg",
					"text": "新建节点",
					"textPosition": "Bottom_Center",
					"level": 2
				}, {
					"elementType": "node",
					"x": 96,
					"y": 122,
					"id": 11712,
					"Image": "cloud.jpg",
					"text": "新建节点",
					"textPosition": "Bottom_Center",
					"level": 1
				}, {
					"elementType": "node",
					"x": 570,
					"y": 125,
					"id": 71250,
					"Image": "serve.jpg",
					"text": "新建节点",
					"textPosition": "Bottom_Center",
					"level": 5
				}, {
					"elementType": "link",
					"nodeAid": 110625,
					"nodeZid": 44770,
					"text": "",
					"fontColor": "0, 200, 255"
				}, {
					"elementType": "link",
					"nodeAid": 71250,
					"nodeZid": 110625,
					"text": "",
					"fontColor": "0, 200, 255"
				}, {
					"elementType": "link",
					"nodeAid": 27178,
					"nodeZid": 110625,
					"text": "",
					"fontColor": "0, 200, 255"
				}, {"elementType": "link", "nodeAid": 11712, "nodeZid": 110625, "text": "", "fontColor": "0, 200, 255"}];
				
				
				tools.orderLosd = orderLosd = {
					init:function(){
						
						var that=this
						jsonObj.forEach(function (a) {
							if (a.text == "三牌楼校区") {
								that.AddTextNode(a.x, a.y, a.text, scene);
							} else if (a.text == "仙林校区") {
								that.AddTextNode(a.x, a.y, a.text, scene);
							} else if (a.elementType == "node") {
								that.AddNodes(a.x, a.y, a.text, a.Image, a.textPosition, a.level);
							}
						})
						jsonObj.forEach(function (a) {
							if (a.elementType == "link") {
								var nodeA = scene.findElements(function (e) {
									return e.id == a.nodeAid;
								});
								var nodeZ = scene.findElements(function (e) {
									return e.id == a.nodeZid;
								});
								if (nodeA[0] && nodeZ[0]) {
									that.Addlink(nodeA[0], nodeZ[0], a.text, a.fontColor);
								}
							}
						})
						//全自动布局
						//scene.doLayout(JTopo.layout.TreeLayout('down', 30, 107));
						stage.click(function (event) {
							if (event.button == 0) {// 右键
								// 关闭弹出菜单（div）
								$("#contextmenu").hide();
								$("#linkmenu").hide();
							}
						});
						
						//右键菜单处理
						$("#contextmenu a").click(function () {
							
							var text = $(this).text();
							if ("取消" == text) {
								$("#contextmenu").hide();
							}
							if (text == '删除该节点') {
								scene.remove(currentNode);
								currentNode = null;
							}
							if (text == '撤销上一次操作') {
								currentNode.restore();
							} else {
								currentNode.save();
							}
							if (text == '添加连线') {
								
							} else if (text == '添加节点') {
								that.AddNodes(tmpx, tmpy, '新建节点', currentNode.Image, 'Bottom_Center', currentNode.level);
							} else if (text == '顺时针旋转') {
								currentNode.rotate += 0.5;
							} else if (text == '逆时针旋转') {
								currentNode.rotate -= 0.5;
							} else if (text == '放大') {
								currentNode.scaleX += 0.2;
								currentNode.scaleY += 0.2;
							} else if (text == '缩小') {
								currentNode.scaleX -= 0.2;
								currentNode.scaleY -= 0.2;
							} else if (text == '警告') {
								if (currentNode.alarm == null) {
									currentNode.alarm = '2W';
								} else {
									currentNode.alarm = null;
								}
								
							}
							$("#contextmenu").hide();
						});
						$("#linkmenu a").click(function () {
							var text = $(this).text();
							if ("取消" == text) {
								$("#linkmenu").hide();
							}
							if (text == '修改颜色(随机)') {
								//currentLink.fillColor = JTopo.util.randomColor();
								currentLink.strokeColor = JTopo.util.randomColor();
							} else if (text == '改为红色') {
								currentLink.strokeColor = '255,0,0';
							} else if (text == '改为普通颜色') {
								currentLink.strokeColor = '0,200,255';
							} else if (text == '删除连线') {
								scene.remove(currentLink);
							} else if (text == '警告') {
								currentLink.alarm = '2W';
							}
							$("#linkmenu").hide();
						});
						var textfield = $("#jtopo_textfield");
						scene.dbclick(function (event) {
							if (event.target == null) return;
							var e = event.target;
							textfield.css({
								top: event.pageY,
								left: event.pageX - e.width / 2
							}).show().attr('value', e.text).focus().select();
							e.text = "";
							textfield[0].JTopoNode = e;
						});
						$("#jtopo_textfield").blur(function () {
							textfield[0].JTopoNode.text = textfield.hide().val();
						});
						$('#contextmenu , #linkmenu').bind('contextmenu',function(){
							return false;
						});
						
						stage.add(scene);
					},
					//乡下滑动加载新页面
					AddNodes:function(x, y, str, img, textPosition, level){
						var that = this;
						var node = new JTopo.Node(str);
						node.serializedProperties.push('id');
						node.serializedProperties.push('level');
						node.setLocation(x, y);
						node.Image = '';
						node.id = x * y;
						node.level = level;
						if (null != img) {
							node.setImage('/statics/img/topology/' + img, false);
							node.Image = img;
						}
						node.textPosition = textPosition;
						node.fontColor = '0,0,0';
						node.setSize(80, 40);
						node.addEventListener('mouseup', function (event) {
							//event.stopPropagation();
							that.handler(event, node);
						});
						node.addEventListener('click', function (event) {
							endNode = node;
							if (null != currentNode && currentNode != endNode) {
								that.Addlink(currentNode, endNode, '');
								currentNode = null;
							}
						});
						scene.add(node);
						return node;
					},
					Addlink: function(node1, node2, str, color){
						
						var that = this;
						var link = new JTopo.Link(node1, node2, str);
						//node2.father = node1;
						link.lineWidth = 3;//线宽
						link.bundleOffset = 60;
						link.bundleGap = 20;
						link.textOffsetY = 3;
						link.fontColor = color || '0, 200, 255';
						link.strokeColor = color || '0, 200, 255';
						link.addEventListener('mouseup', function (event) {
							currentLink = this;
							that.handlelink(event);
						});
						link.addEventListener('dbclick', function (event) {
							if (confirm('是否删除连线')) {
								scene.remove(link);
							}
						});
						scene.add(link);
					},
					AddTextNode: function(x, y, str, scenemodle){
						
						var that = this;
						var node = new JTopo.Node(str);
						node.setLocation(x, y);
						node.serializedProperties.push('id');
						node.id = x + y;
						node.fillColor = '255,255,255';
						node.textPosition = 'Middle_Center';
						node.fontColor = '0,0,0';
						node.setSize(120, 30);
						node.dragable = false;
						node.showSelected = false;
						node.selected = false;
						scenemodle.add(node);
					},
					handlelink:function(event){
						var   that=this;
						$("#contextmenu").hide();
						if (event.button == 2) {
							
							$("#linkmenu").css({
								top: event.pageY,
								left: event.pageX
							}).show();
						}
					},
					//点击事件
					handler:function(event, obj){
						var   that=this;
						$("#linkmenu").hide();
						
						if (event.button == 2) {//右键
							currentNode = obj;
							tmpx = event.pageX + 30;
							tmpy = event.pageY + 30;
							$("#contextmenu").css({
								top: event.pageY - 54,
								left: event.pageX - 200
							}).show();
						}
						if(event.button ==0){
							$(".name_node").val(obj.text)
							$(".id_node").val(obj.id);
							$(".weith_node").val(obj.width)
							$(".length_node").val(obj.height);
						}
					}
					
				};
			}(window, jQuery));
//orderTab.js
			(function(self, $){
				var tools = ORDER.tools,
					orderLosd = tools.orderLosd,
					orderTab;
				var scenemodle = new JTopo.Scene();
				var canvas = document.getElementById('canvas1');
				canvas.height = 100;
				canvas.width = window.innerWidth * 0.98;
				scenemodle.background = '/statics/img/topology/bg.jpg';
				var stage = new JTopo.Stage(canvas);
//        stage.eagleEye.visible = true;  //显示小图的
				// showJTopoToobar(stage);
				var currentNode = null;
				var endNode = null;
				var tmpx = null;
				var tmpy = null;
				var jsonstr = null;
				var position = ["Middle_Center","Middle_Right","Middle_Left","Bottom_Center"];
				var jsonStr = '[' +
					'{"elementType":"node","x": 20, "y":20,"dragable":"true","id":7920,"Image":"cloud.jpg","text":"CERNET","textPosition":"Middle_Center","level":1},' +
					'{"elementType":"node","x": 120,"y": 20,"dragable":"false","id": 34880,  "Image": "8000.jpg", "text": "Cabletron\\n8000", "textPosition": "Bottom_Center",  "level": 2 },' +
					'{"elementType":"node","x": 220,"y": 20,"dragable":"false","id": 61040,"Image": "ER16.jpg","text": "凯创ER16","textPosition": "Bottom_Center", "level": 3 },' +
					'{"elementType":"node","x": 320,"y": 20,"dragable":"false","id": 100360,"Image": "5200.jpg","text": "HUAWEI\\n5200A","textPosition": "Bottom_Center","level": 4},' +
					'{"elementType":"node","x": 420,"y": 20,"dragable":"false","id": 201760,"Image": "中间.jpg","text": "交换机","textPosition": "Bottom_Center", "level": 4  },' +
					'{"elementType":"node","x": 520,"y": 20,"dragable":"false","id": 82080,"Image": "serve.jpg","text": "EMC存储","textPosition": "Bottom_Center","level": 5    },' +
					'{"elementType":"node","x": 620,"y": 20,"dragable":"false","id": 112480,"Image": "2948.jpg","text": "VH4802","textPosition": "Bottom_Center","level": 5 },' +
					']';
				var jsonObj = eval("(" + jsonStr + ")");
				//order list
				
				tools.orderTab = orderTab =function(){
					this.init();
				}
				orderTab.prototype = {
					init:function(){
						
						var that=this
						jsonObj.forEach(function (a) {
							if (a.text == "三牌楼校区") {
								AddTextNode(a.x, a.y, a.text, scene);
							} else if (a.text == "仙林校区") {
								AddTextNode(a.x, a.y, a.text, scene);
							} else if (a.elementType == "node") {
								that.AddNode(a.x, a.y, a.text, a.Image, a.textPosition, a.level, a.dragable);
							}
						})
						
						
						stage.add(scenemodle);
					},
					//乡下滑动加载新页面
					AddNode:function(x, y, str, img, textPosition, level,dragable){
						var that = this;
						var node = new JTopo.Node(str);
						node.serializedProperties.push('id');
						node.serializedProperties.push('level');
						node.setLocation(x, y);
						node.Image = '';
						node.id = x * y;
						node.dragable= dragable;
						node.level = level;
						if (null != img) {
							node.setImage('/statics//img/topology/' + img, false);
							node.Image = img;
						}
						node.textPosition = textPosition;
						node.fontColor = '0,0,0';
						node.setSize(80, 40);
						node.addEventListener('mouseup', function (event) {
							that.handler(event, node);
						});
						node.addEventListener('dbclick', function (event) {
							that.copyer(event, node);
							
						});
						node.addEventListener('click', function (event) {
							endNode = node;
							if (null != currentNode && currentNode != endNode) {
								
								currentNode = null;
							}
						});
						if(str=='新建节点'){
							console.log(node)
							scene.add(node);
						}else{
							scenemodle.add(node);
							
						}
						return node;
					},
					
					
					AddTextNode: function(x, y, str, scenemodle){
						
						var that = this;
						var node = new JTopo.Node(str);
						node.setLocation(x, y);
						node.serializedProperties.push('id');
						node.id = x + y;
						node.fillColor = '255,255,255';
						node.textPosition = 'Middle_Center';
						node.fontColor = '0,0,0';
						node.setSize(120, 30);
						node.dragable = false;
						node.showSelected = false;
						node.selected = false;
						scenemodle.add(node);
					},
					copyer:function(event,obj){
						var   that=this;
						currentNode = obj;
						tmpx = event.pageX + 30;
						tmpy = event.pageY + 30;
						orderLosd.AddNodes(tmpx, tmpy, '新建节点', currentNode.Image, 'Bottom_Center', currentNode.level);
						
					},
					handler:function(event, obj){
						
						var   that=this;
						currentNode = obj;
						tmpx = event.pageX + 30;
						tmpy = event.pageY + 30;
						
						
					}
				};
			}(window,jQuery));
			
			new ORDER.tools.orderTab();
			ORDER.tools.orderLosd.init();
			
			
		})( jQuery, window, document );
	}
]);
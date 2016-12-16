app.controller('DashboradAssetsViewCtrl', ['$rootScope', '$scope', 'httpLoad','$stateParams','$state','$timeout',function($rootScope, $scope, httpLoad,$stateParams,$state,$timeout) {
	$rootScope.link = '/statics/css/graph.css';
	var TaskExecute = function () {
		this.InitContent();
	}
	TaskExecute.prototype = {
		InitContent:function(){
			this.scene = new JTopo.Scene();
			this.scene.background = '/statics/img/topology/bg.jpg';
			var canvas = document.getElementById('views');
			canvas.height = window.innerHeight * 0.8;
			canvas.width = window.innerWidth * 0.85;
			this.stage = new JTopo.Stage(canvas);
			this.stage.add(this.scene);
			this.stage.wheelZoom = 1.15;//鼠标缩放
		},
		//初始绘制节点
		DrawNode:function(data,flag){
			var that = this;
			var img = {
				dc:'datacenter.png',
				room:'room.png',
				rack:'rack.png',
				MAINFRAME:'server.png',
				MINICOMPUTER:'server.png',
				PC:'server.png',
				SWITCH:'switch.png',
				HDS:'storage.png',
				NAS:'storage.png',
				SAN:'storage.png',
				ROUTER:'router.png',
				LB:'lb.png'
			};
			if(flag){
				var map = ['rooms','racks','servers']
				var xAxix = 0;
				if(data[map[$stateParams.flag-1]] > 5){
					xAxix = 240;
				}else{
					xAxix = Math.abs((data[map[$stateParams.flag-1]]-1)/2*120);
				}
				that.AddNode(xAxix,30,data.name,img[data.type],data,flag);
			}else{
				var x = -120,y = 0,count = 0;
				data.forEach(function(item,index){
					var num = Math.floor(index/5);
					if(count != num){
						x = -120;
						count = num;
					}
					y = 140*(count+1);
					x += 120;
					that.AddNode(x,y,item.name,img[item.type],item);
				});
			};
			$timeout(function () {
				that.stage.centerAndZoom();
			});
			// data.links.forEach(function (item) {
			// 	var nodeA = that.scene.findElements(function (e) {
			// 		return e.id == item.nodeAid;
			// 	});
			// 	var nodeZ = that.scene.findElements(function (e) {
			// 		return e.id == item.nodeZid;
			// 	});
			// 	if (nodeA[0] && nodeZ[0]) {
			// 		that.AddLink(nodeA[0], nodeZ[0], item.text);
			// 	}
			// });
		},
		//添加节点
		AddNode:function(x, y, str, img, nodeData,flag){
			var node = new JTopo.Node(str);
			node.setLocation(x, y);
			node.nodeData = nodeData;
			node.setImage('/statics/img/dashborad/infrastructure/' + img, false);
			node.Image = img;
			node.fontColor = '88,102,110';//设置文字颜色
			node.setSize(100,100);//设置图标大小
			node.dragable = false;//不允许拖拽
			this.EveSetNode(node);
			if(!flag)  this.EveSetNode_Click(node);
			this.scene.add(node);
			return node;
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
			this.scene.add(link);
		},
		DrawDetail:function(data){
			var status = {
					RUNNING: '运行中',
					STOP: '停止',
					CREATED:'新建',
					NORMAL: '正常',
					ALARM: '告警',
					ABNORMAL: '异常',
					DISABLED: '不可用'
				};
			$('.detail-title').html(data.name)
			var html = [];
			var dc = function(){
				html.push('<p> <span>状态：</span><span>'+status[data.status]+'</span></p>');
				html.push('<p> <span>描述：</span><span>'+data.remark+'</span></p>');
			};
			var room = function(){
				html.push('<p> <span>状态：</span><span>'+status[data.status]+'</span></p>');
				html.push('<p> <span>描述：</span><span>'+data.remark+'</span></p>');;
			};
			var rack = function(){
				html.push('<p> <span>状态：</span><span>'+status[data.status]+'</span></p>');
				html.push('<p> <span>描述：</span><span>'+data.remark+'</span></p>');
			};
			var server = function(){
				html.push('<p> <span>状态：</span><span>'+status[data.status]+'</span></p>');
				html.push('<p> <span>描述：</span><span>'+data.remark+'</span></p>');
			};
			switch ($stateParams.flag/1){
				case 1:
					dc();
					break;
				case 2:
					room();
					break;
				case 3:
					rack();
					break;
				case 4:
					server();
					break;
			};
			$('.detail-content').html(html.join(''));
		},
		//对内容节点的操作
		EveSetNode_Click:function(node){
			node.addEventListener('click', function (event) {
				if($stateParams.flag == 3) return;
				var flag = $stateParams.flag/1 + 1;
				$state.go('app.graph.assetsview',{flag:flag,id:node.nodeData.id})
			});
		},
		EveSetNode:function(node){
			var that = this;
			node.addEventListener('mousemove', function (event) {
				that.DrawDetail(node.nodeData);
				$(".graph-detail").css({
					top: event.offsetY +20,
					left: event.offsetX + 20
				}).show();
			});
			node.addEventListener('mouseout', function (event) {
				$(".graph-detail").hide();
			});
		}
	};
	var TaskExecute = new TaskExecute();
	var getDataCenter = function(){
		httpLoad.loadData({
			url: '/dc/detail',
			method: 'GET',
			data:{
				id:$stateParams.id
			},
			success: function(data){
				if(data.success) {
					data.data.type = 'dc';
					TaskExecute.DrawNode(data.data,1)
				}
			}
		});
		httpLoad.loadData({
			url: '/room/list',
			method: 'POST',
			data:{
				page:1,
				rows:65536,
				params: angular.toJson([{param:{dcId:$stateParams.id},sign:'EQ'}])
			},
			noParam:true,
			success: function(data){
				if(data.success) {
					data.data.rows.forEach(function (item) {
						item.type = 'room';
					});
					TaskExecute.DrawNode(data.data.rows)
				}
			}
		});
	};
	var getRoom = function(){
		httpLoad.loadData({
			url: '/room/detail',
			method: 'GET',
			data:{
				id:$stateParams.id
			},
			success: function(data){
				if(data.success) {
					data.data.type = 'room';
					TaskExecute.DrawNode(data.data,1)
				}
			}
		});
		httpLoad.loadData({
			url: '/rack/list',
			method: 'POST',
			data:{
				page:1,
				rows:65536,
				params: angular.toJson([{param:{roomId:$stateParams.id},sign:'EQ'}]),
			},
			noParam:true,
			success: function(data){
				data.data.rows.forEach(function (item) {
					item.type = 'rack';
				})
				if(data.success) {
					TaskExecute.DrawNode(data.data.rows)
				}
			}
		});
	};
	var getRack = function(){
		httpLoad.loadData({
			url: '/rack/detail',
			method: 'GET',
			data:{
				id:$stateParams.id
			},
			success: function(data){
				if(data.success) {
					data.data.type = 'rack';
					TaskExecute.DrawNode(data.data,1)
				}
			}
		});
		httpLoad.loadData({
			url: '/rack/resources',
			method: 'GET',
			data:{
				id:$stateParams.id
			},
			success: function(data){
				if(data.success) {
					TaskExecute.DrawNode(data.data.server.concat(data.data.storage,data.data.network))
				}
			}
		});
	};
	switch ($stateParams.flag/1){
		case 1:
			$rootScope.moduleTitle = '数据纵览 > 数据中心视图';
			getDataCenter();
			break;
		case 2:
			$rootScope.moduleTitle = '数据纵览 > 机房视图';
			getRoom();
			break;
		case 3:
			$rootScope.moduleTitle = '数据纵览 > 机柜视图';
			getRack();
			break;
	};
	$scope.goBack = function () {
		history.go(-1);
	}
}]);
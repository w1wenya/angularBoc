/**
 * Created by Zhang Haijun on 2016/8/31.
 */
(function(){
	app.controller('ImmediatelyBackupCtrl', ['$rootScope', '$scope', 'httpLoad', '$state', '$modal', function($rootScope, $scope, httpLoad, $state,$modal) {
			$scope.param = {
			page: 1,
			rows: 10,
			params: angular.toJson([{param:{kind:'BACKUP'},sign:'EQ'}])
		};
		$scope.getList = function(page){
			if(page == 1) $rootScope.moduleTitle = '日常作业 > 备份作业';
			$scope.param.page = page || $scope.param.page;
			httpLoad.loadData({
				url: '/task/graph/list',
				data: $scope.param,
				noParam: true,
				success: function(data){
					$scope.listData = data.data.rows;
					$scope.totalPage = data.data.total;
				}
			});
		};
		//对参数进行处理，去除空参数
		var toObjFormat = function(obj) {
			for (var a in obj) {
				if (obj[a] == "") delete obj[a];
			}
			return obj;
		}
		$scope.createTask = function(){
			$state.go('app.operation.newtask',{
				flag:4,
				id:''
			})
		};
		$scope.goEdit = function(id,flag){
			$state.go('app.operation.newtask',{
				flag:flag,
				id:id
			});
		};
		$scope.createTimeTask = function (item) {
			$modal.open({
				templateUrl : '/statics/tpl/operation/tasklist/addTimeTaskModal.html',
				controller : 'addTimedBackupLModalCtrl',
				resolve : {
					item : function(){
						return item;
					}
				}
			});
		}
		$scope.remove = function (id){
			var modalInstance = $modal.open({
				templateUrl: '/statics/tpl/operation/tasklist/delTaskModal.html',
				controller: 'delTaskModalCtrl',
				backdrop: 'static',
				resolve: {
					id: function() {
						return  id;
					},
				}
			});
			modalInstance.result.then(function() {
				$scope.getList();
			});
		}
		//搜索
		$scope.search = function(){
			//对时间进行处理
			var toFormatTime = function(time, place) {
				if (!time) return "";
				var date = time.split(' - ');
				return date[place/1];
			}
			var params = [];
			var param1 = toObjFormat({
				name: $scope.name,
				
			});
			var param2 = toObjFormat({
				kind: 'BACKUP'
			});
			if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
			if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
			if ($scope.date) {
				params.push({param: {gmtCreate: toFormatTime($scope.date, 0)}, sign: 'GET'});
				params.push({param: {gmtCreate: toFormatTime($scope.date, 1)}, sign: 'LET'});
			}
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson(params)
			}
			$scope.getList()
		}
		//重置搜索条件
		$scope.reset = function(){
			var obj = ['name'];
			angular.forEach(obj,function(data){
				$scope[data] = '';
			})
		}
	}]);
	//新增定时ctrl
	app.controller('addTimedBackupLModalCtrl',['$scope','$modalInstance','httpLoad','item',
		function($scope,$modalInstance,httpLoad,item){
			$scope.taskName = item.name;
			$scope.addData={
				name:item.name,
				taskId:item.id,
				kind:'BACKUP'
			};
			$scope.timedRule = 0;$scope.minuteRule = 0;$scope.hourRule = 0;$scope.dayRule =  0;$scope.monthRule =  0;
			$scope.minuteStart = 1;$scope.minuteEnd = 5;$scope.conMinute = "*";
			$scope.everyweek = 0;
			$scope.minuteList = [];$scope.hourList = [];$scope.dayList = [];$scope.monthList = [];
			$scope.weekList = [{"day":"星期日","num":7,"isSelected":false},{"day":"星期一","num":1,"isSelected":false},{"day":"星期二","num":2,"isSelected":false},{"day":"星期三","num":3,"isSelected":false},{"day":"星期四","num":4,"isSelected":false},{"day":"星期五","num":5,"isSelected":false},{"day":"星期六","num":6,"isSelected":false}];
			$scope.weekCrons = "?";$scope.hourCrons = "*";$scope.dayCrons = "*";$scope.monthCrons = "*";
			$scope.isDay = true;$scope.isWeek = true;
			
			for(var i=0;i<60;i++) $scope.minuteList.push({"num":i,"isSelected":false});
			for(var j=0;j<24;j++) $scope.hourList.push({"num":j,"isSelected":false});
			for(var m=1;m<32;m++) $scope.dayList.push({"num":m,"isSelected":false});
			for(var n=1;n<13;n++) $scope.monthList.push({"num":n,"isSelected":false});
			//$scope.crons = 0 + " " + $scope.minuteStart+'/'+$scope.minuteEnd + " " + $scope.hourCrons + " " + $scope.dayCrons + " " + $scope.monthCrons + " " + $scope.weekCrons;
			
			//自定义
			$scope.crons = '0 1/5 * * * ?';
			//指定
			var conMin1 = [];var conMin2 = [];var conMin3 = [];var conMin4 = [];var conMin5 = [];
			$scope.getConMinute = function(num,isSelected){  //处理指定分钟
				if($scope.conMinute == "*"){
					$scope.conMinute = "";
					var conMin = [];
				}else{
					var conMin = $scope.conMinute.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin1.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin1.push(num);
					}
					angular.forEach($scope.minuteList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) if(conMin[a]==num) conMin1.splice(a,1);
					}
					angular.forEach($scope.minuteList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.conMinute = conMin1.join(",");
				if($scope.conMinute=="") $scope.conMinute="*"; //如果什么都不选，则为“*”
			};
			$scope.checkMinute = function(value){   //设定分钟规则
				$scope.minuteRule = value;
			};
			$scope.checkcircleMinute = function(value,index){
				var num = parseInt(value);
				if(index==0){
					$scope.minuteStart = value;
					//检测是否为整数
					if(/^\d+$/.test($scope.minuteStart)==false){
						$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
						return;
					}
					if(num>59||num<0){
						$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
						return;
					}
				}
				if(index==1){
					$scope.minuteEnd = value;
					//检测是否为整数
					if(/^\d+$/.test($scope.minuteEnd)==false){
						$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
						return;
					}
					if(num>50||num<1){
						$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
						return;
					}
				}
			};
			
			//小时
			$scope.checkHour = function(value){
				$scope.hourRule = value;
				if(value==0){
					$scope.hourCrons="*";
					angular.forEach($scope.hourList, function(data, key){
						data.isSelected = false;
					});
				}
			};
			$scope.getHour = function(num,isSelected){  //处理指定小时
				if($scope.hourCrons == "*"){
					$scope.hourCrons = "";
					var conMin = conMin2 = [];
				}else{
					var conMin = $scope.hourCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin2.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin2.push(num);
					}
					angular.forEach($scope.hourList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) conMin2.splice(a,1);
					}
					angular.forEach($scope.hourList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.hourCrons = conMin2.join(",");
				if($scope.hourCrons=="") $scope.hourCrons="*"; //如果什么都不选，则为“*”
			};
			
			//天
			$scope.checkDay = function(value){
				$scope.dayRule = value;
				if(value==0){
					$scope.isDay = true;$scope.weekRule =false;$scope.isWeek=false;
					$scope.dayCrons="*";$scope.weekCrons="?";
					angular.forEach($scope.dayList, function(data, key){
						data.isSelected = false;
					});
				}
				if(value==1){
					$scope.isDay = false;
					$scope.weekCrons = "?";$scope.weekRule = false;$scope.isWeek = true;
				}
			};
			$scope.getDay = function(num,isSelected){  //处理指定天
				if($scope.dayCrons == "*"){
					$scope.dayCrons = "";
					var conMin = conMin3 = [];
				}else{
					var conMin = $scope.dayCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin3.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin3.push(num);
					}
					angular.forEach($scope.dayList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) if(conMin[a]==num) conMin3.splice(a,1);
					}
					angular.forEach($scope.dayList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.dayCrons = conMin3.join(",");
				if($scope.dayCrons=="") $scope.dayCrons="*"; //如果什么都不选，则为“*”
			};
			
			//月
			$scope.checkMonth = function(value){
				$scope.monthRule = value;
				if(value==0){
					$scope.monthCrons="*";
					angular.forEach($scope.monthList, function(data, key){
						data.isSelected = false;
					});
				}
			};
			$scope.getMonth = function(num,isSelected){  //处理指定月
				if($scope.monthCrons == "*"){
					$scope.monthCrons = "";
					var conMin = conMin4 = [];
				}else{
					var conMin = $scope.monthCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin4.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin4.push(num);
					}
					angular.forEach($scope.monthList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) if(conMin[a]==num) conMin4.splice(a,1);
					}
					angular.forEach($scope.monthList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.monthCrons = conMin4.join(",");
				if($scope.monthCrons=="") $scope.monthCrons="*"; //如果什么都不选，则为“*”
			};
			
			//星期
			$scope.checkWeekRule = function(){
				var value = !$scope.weekRule;
				if(value==true) {
					$scope.dayCrons = "?";$scope.weekCrons = "*";
					angular.forEach($scope.weekList, function(data, key){
						data.isSelected = false;
					});
					$scope.isDay = true;$scope.isWeek = true;
				}else{
					if($scope.dayCrons=="*") return;
					$scope.dayCrons = "";$scope.weekCrons = "?";
					angular.forEach($scope.dayList, function(data, key){
						if(data.isSelected) $scope.dayCrons = $scope.dayCrons+','+data.num;
					});
					$scope.dayCrons = $scope.dayCrons.substr(1);
					$scope.isDay = false;$scope.isWeek = true;
				}
			};
			$scope.checkWeek = function(value){
				if(value==0){
					$scope.isWeek = true;
					$scope.weekCrons="*";
					angular.forEach($scope.weekList, function(data, key){
						data.isSelected = false;
					});
				}
				if(value==1) $scope.isWeek = false;
			};
			$scope.getWeek = function(num,isSelected){  //处理指定月
				if($scope.weekCrons == "*"){
					$scope.weekCrons = "";
					var conMin = conMin5 = [];
				}else{
					var conMin = $scope.weekCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin5.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin5.push(num);
					}
					angular.forEach($scope.weekList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) if(conMin[a]==num) conMin5.splice(a,1);
					}
					angular.forEach($scope.weekList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.weekCrons = conMin5.join(",");
				if($scope.weekCrons=="") $scope.weekCrons="*"; //如果什么都不选，则为“*”
			};
			
			$scope.ok = function(){
				//处理表达式
				if($scope.timedRule==0){
					$scope.addData.isDiy = true;
					if($scope.minuteRule==0){
						var num1 = parseInt($scope.minuteStart);var num2 = parseInt($scope.minuteEnd);
						if(($scope.minuteStart=="")|| ($scope.minuteEnd=="")){
							$scope.pop('请设定分钟的循环规则','error');
							return;
						}
						//检测是否为整数
						if(/^\d+$/.test($scope.minuteStart)==false){
							$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
							return;
						}
						if(/^\d+$/.test($scope.minuteEnd)==false){
							$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
							return;
						}
						if(num1>59||num1<0){
							$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
							return;
						}
						if(num2>50||num2<1){
							$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
							return;
						}
						$scope.crons = 0 + ' '+ $scope.minuteStart + '/' + $scope.minuteEnd+' '+$scope.hourCrons+' '+$scope.dayCrons+' '+$scope.monthCrons+' '+$scope.weekCrons;
					}
					if($scope.minuteRule==1){
						if($scope.conMinute=="*"){
							$scope.pop('请设定分钟的指定规则','error');
							return;
						}
						$scope.crons = 0 + ' '+ $scope.conMinute +' '+ $scope.hourCrons+' '+$scope.dayCrons+' '+$scope.monthCrons+' '+$scope.weekCrons;
					}
				}
				if($scope.timedRule==1){
					$scope.addData.isDiy = false;
					//var arrayList = $scope.crons.split(' ');
					//if(arrayList[1].indexOf('/')>0){
					//    var array1 = arrayList[1].split('/');
					//    var num1 = parseInt(array1[0]);var num2 = parseInt(array1[1]);
					//    if(num1>59||num1<0){
					//        $scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
					//        return;
					//    }
					//    if(num2>50||num2<1){
					//        $scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
					//        return;
					//    }
					//}
				}
				$scope.addData.crons = $scope.crons;
				if($scope.addData.crons==""){
					$scope.pop('请设定定时规则','error');
					return;
				}
				httpLoad.loadData({
					url:'/cron/create',
					method:'POST',
					data: $scope.addData,
					success:function(data){
						if(data.success){
							$scope.pop('定时任务 ['+$scope.addData.name+'] 添加成功');
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel');
			};
		}]);
	app.controller('TimedBackupCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', function($rootScope, $scope, httpLoad, $modal) {
		$scope.params = {
			page: 1,
			rows: 10,
			params: angular.toJson([{param:{kind:'BACKUP'},sign:'EQ'}])
		};
		//获取定时作业列表
		$scope.getData = function(page){
			if(page == 1) 	$rootScope.moduleTitle = '日常作业 > 定时备份';
			$scope.params.page = page || $scope.params.page;
			httpLoad.loadData({
				url:'/cron/list',
				method: 'POST',
				data: $scope.params,
				noParam: true,
				success:function(data){
					if(data.success&&data.data){
						//console.log(params);
						$scope.timedOperationList = data.data.rows;
						$scope.totalCount = data.data.total;
						$scope.isImageData = false;
						angular.forEach($scope.timedOperationList, function (data, key) {
							if (data.status == "UNEXECUTE" || data.status == "PAUSED") data.operateName = "激活";
							if (data.status == "RUNNING" || data.status == 'WAITING') data.operateName = "挂起";
						});
					}else{
						$scope.isImageData = true;
					}
				}
			});
		};
		//状态数据
		$scope.statusData = [{"value":"UNEXECUTE","name":"未执行"},{"value":"RUNNING","name":"执行中"},{"value":"WAITING","name":"等待"},{"value":"PAUSED","name":"暂停"}];
		/*$scope.loadStatus = function(){
		 var params = {value : "STATUS_CATEGORY"};
		 httpLoad.loadData({
		 url:'/dict/children',
		 method: 'POST',
		 data: params,
		 success:function(data){
		 if(data.success&&data.data){
		 //console.log(params);
		 $scope.statusData = data.data;
		 }
		 }
		 });
		 };
		 $scope.loadStatus();*/
		//对参数进行处理，去除空参数
		var toObjFormat = function(obj) {
			for (var a in obj) {
				if (obj[a] == "") delete obj[a];
			}
			return obj;
		};
		//搜索
		$scope.search = function(){
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
				creator:$scope.creator
			});
			var param3 = toObjFormat({
				mender:$scope.mender
			});
			var param4 = toObjFormat({
				status:$scope.status
			});
			if (param1.name != ""&&param1.name) params.push({param: param1, sign: 'LK'});
			if (param2.creator != ""&&param2.creator) params.push({param: param2, sign: 'EQ'});
			if (param3.mender != ""&&param3.mender) params.push({param: param3, sign: 'EQ'});
			if (param4.status != ""&&param4.status) params.push({param: param4, sign: 'EQ'});
			params.push({param:{kind:'BACKUP'}, sign: 'EQ'});
			if ($scope.gmtCreate) {
				params.push({param: {gmtCreate: toFormatTime($scope.gmtCreate, 0)}, sign: 'GET'});
				params.push({param: {gmtCreate: toFormatTime($scope.gmtCreate, 1)}, sign: 'LET'});
			}
			if ($scope.gmtModify) {
				params.push({param: {gmtModify: toFormatTime($scope.gmtModify, 0)}, sign: 'GET'});
				params.push({param: {gmtModify: toFormatTime($scope.gmtModify, 1)}, sign: 'LET'});
			}
			$scope.params = {
				page: 1,
				rows: 10,
				params: JSON.stringify(params)
			};
			$scope.getData(1);
		};
		//重置搜索条件
		$scope.reset = function(){
			var obj = ['name','creator','mender','status','gmtCreate','gmtModify'];
			angular.forEach(obj,function(data){
				$scope[data] = '';
			})
		};
		//获取任务名称数
		var taskParam = [];var taskParams = {};
		taskParam.push({param: {"kind":"BACKUP"}, sign: 'EQ'});
		taskParams.params = JSON.stringify(taskParam);
		taskParams.simple = true;
		httpLoad.loadData({
			url:'/task/graph/list',
			method: 'POST',
			noParam: true,
			data: taskParams,
			success:function(data){
				if(data.success&&data.data){
					//console.log(params);
					$scope.taskList = data.data.rows;
				}
			}
		});
		//启动
		$scope.start = function(id,name,$event,$index){
			httpLoad.loadData({
				url:'/cron/active',
				method:'GET',
				data: {id: id},
				success:function(data){
					if(data.success){
						$scope.getData();
						$scope.pop('定时任务【'+name+'】状态修改成功');
					}
				}
			});
		};
		//暂停
		$scope.stop = function(id,name,$event,$index){
			httpLoad.loadData({
				url:'/cron/suspend',
				method:'GET',
				data: {id: id},
				success:function(data){
					if(data.success){
						$scope.getData();
						$scope.pop('定时任务【'+name+'】状态修改成功');
					}
				}
			});
		};
		//新增
		$scope.add = function($event,size){
			$event.stopPropagation();
			var modalInstance = $modal.open({
				templateUrl : '/statics/tpl/operation/timedOperation/add.html',
				controller : 'addTimedBackupModalCtrl',
				size : size,
				resolve : {
					timedOperationList : function(){
						return $scope.timedOperationList;
					},
					taskList : function(){
						return $scope.taskList;
					}
				}
			});
			modalInstance.result.then(function(result){
				$scope.getData();
			},function(){});
		};
		//编辑
		$scope.update = function($event,$index,row,key,size){
			$event.stopPropagation();
			var modalInstance = $modal.open({
				templateUrl : '/statics/tpl/operation/timedOperation/update.html',
				controller : 'updateTimedBackupModalCtrl',
				size : size,
				resolve : {
					updateData : function(){
						return row;
					},
					taskList : function(){
						return $scope.taskList;
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
				templateUrl : '/statics/tpl/operation/timedOperation/remove.html',
				controller : 'removeTimedBackupModalCtrl',
				resolve : {
					index : function(){
						return $index;
					},
					removeData : function(){
						return $scope.removeData;
					},
					timedOperationList : function(){
						return $scope.timedOperationList;
					}
				}
			});
			modalInstance.result.then(function(){
				$scope.getData();
			},function(){});
		};
	}]);
	//新增ctrl
	app.controller('addTimedBackupModalCtrl',['$scope','$modalInstance','httpLoad','timedOperationList','taskList',
		function($scope,$modalInstance,httpLoad,timedOperationList,taskList){
			$scope.addData={};
			$scope.taskList = taskList;
			$scope.timedRule = 0;$scope.minuteRule = 0;$scope.hourRule = 0;$scope.dayRule =  0;$scope.monthRule =  0;
			$scope.minuteStart = 1;$scope.minuteEnd = 5;$scope.conMinute = "*";
			$scope.everyweek = 0;
			$scope.minuteList = [];$scope.hourList = [];$scope.dayList = [];$scope.monthList = [];
			$scope.weekList = [{"day":"星期日","num":7,"isSelected":false},{"day":"星期一","num":1,"isSelected":false},{"day":"星期二","num":2,"isSelected":false},{"day":"星期三","num":3,"isSelected":false},{"day":"星期四","num":4,"isSelected":false},{"day":"星期五","num":5,"isSelected":false},{"day":"星期六","num":6,"isSelected":false}];
			$scope.weekCrons = "?";$scope.hourCrons = "*";$scope.dayCrons = "*";$scope.monthCrons = "*";
			$scope.isDay = true;$scope.isWeek = true;
			
			for(var i=0;i<60;i++) $scope.minuteList.push({"num":i,"isSelected":false});
			for(var j=0;j<24;j++) $scope.hourList.push({"num":j,"isSelected":false});
			for(var m=1;m<32;m++) $scope.dayList.push({"num":m,"isSelected":false});
			for(var n=1;n<13;n++) $scope.monthList.push({"num":n,"isSelected":false});
			//$scope.crons = 0 + " " + $scope.minuteStart+'/'+$scope.minuteEnd + " " + $scope.hourCrons + " " + $scope.dayCrons + " " + $scope.monthCrons + " " + $scope.weekCrons;
			
			//自定义
			$scope.crons = '0 1/5 * * * ?';
			//指定
			var conMin1 = [];var conMin2 = [];var conMin3 = [];var conMin4 = [];var conMin5 = [];
			$scope.getConMinute = function(num,isSelected){  //处理指定分钟
				if($scope.conMinute == "*"){
					$scope.conMinute = "";
					var conMin = [];
				}else{
					var conMin = $scope.conMinute.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin1.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin1.push(num);
					}
					angular.forEach($scope.minuteList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) if(conMin[a]==num) conMin1.splice(a,1);
					}
					angular.forEach($scope.minuteList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.conMinute = conMin1.join(",");
				if($scope.conMinute=="") $scope.conMinute="*"; //如果什么都不选，则为“*”
			};
			$scope.checkMinute = function(value){   //设定分钟规则
				$scope.minuteRule = value;
			};
			$scope.checkcircleMinute = function(value,index){
				var num = parseInt(value);
				if(index==0){
					$scope.minuteStart = value;
					//检测是否为整数
					if(/^\d+$/.test($scope.minuteStart)==false){
						$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
						return;
					}
					if(num>59||num<0){
						$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
						return;
					}
				}
				if(index==1){
					$scope.minuteEnd = value;
					//检测是否为整数
					if(/^\d+$/.test($scope.minuteEnd)==false){
						$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
						return;
					}
					if(num>50||num<1){
						$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
						return;
					}
				}
			};
			
			//小时
			$scope.checkHour = function(value){
				$scope.hourRule = value;
				if(value==0){
					$scope.hourCrons="*";
					angular.forEach($scope.hourList, function(data, key){
						data.isSelected = false;
					});
				}
			};
			$scope.getHour = function(num,isSelected){  //处理指定小时
				if($scope.hourCrons == "*"){
					$scope.hourCrons = "";
					var conMin = conMin2 = [];
				}else{
					var conMin = $scope.hourCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin2.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin2.push(num);
					}
					angular.forEach($scope.hourList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) conMin2.splice(a,1);
					}
					angular.forEach($scope.hourList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.hourCrons = conMin2.join(",");
				if($scope.hourCrons=="") $scope.hourCrons="*"; //如果什么都不选，则为“*”
			};
			
			//天
			$scope.checkDay = function(value){
				$scope.dayRule = value;
				if(value==0){
					$scope.isDay = true;$scope.weekRule =false;$scope.isWeek=false;
					$scope.dayCrons="*";$scope.weekCrons="?";
					angular.forEach($scope.dayList, function(data, key){
						data.isSelected = false;
					});
				}
				if(value==1){
					$scope.isDay = false;
					$scope.weekCrons = "?";$scope.weekRule = false;$scope.isWeek = true;
				}
			};
			$scope.getDay = function(num,isSelected){  //处理指定天
				if($scope.dayCrons == "*"){
					$scope.dayCrons = "";
					var conMin = conMin3 = [];
				}else{
					var conMin = $scope.dayCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin3.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin3.push(num);
					}
					angular.forEach($scope.dayList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) if(conMin[a]==num) conMin3.splice(a,1);
					}
					angular.forEach($scope.dayList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.dayCrons = conMin3.join(",");
				if($scope.dayCrons=="") $scope.dayCrons="*"; //如果什么都不选，则为“*”
			};
			
			//月
			$scope.checkMonth = function(value){
				$scope.monthRule = value;
				if(value==0){
					$scope.monthCrons="*";
					angular.forEach($scope.monthList, function(data, key){
						data.isSelected = false;
					});
				}
			};
			$scope.getMonth = function(num,isSelected){  //处理指定月
				if($scope.monthCrons == "*"){
					$scope.monthCrons = "";
					var conMin = conMin4 = [];
				}else{
					var conMin = $scope.monthCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin4.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin4.push(num);
					}
					angular.forEach($scope.monthList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) if(conMin[a]==num) conMin4.splice(a,1);
					}
					angular.forEach($scope.monthList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.monthCrons = conMin4.join(",");
				if($scope.monthCrons=="") $scope.monthCrons="*"; //如果什么都不选，则为“*”
			};
			
			//星期
			$scope.checkWeekRule = function(){
				var value = !$scope.weekRule;
				if(value==true) {
					$scope.dayCrons = "?";$scope.weekCrons = "*";
					angular.forEach($scope.weekList, function(data, key){
						data.isSelected = false;
					});
					$scope.isDay = true;$scope.isWeek = true;
				}else{
					if($scope.dayCrons=="*") return;
					$scope.dayCrons = "";$scope.weekCrons = "?";
					angular.forEach($scope.dayList, function(data, key){
						if(data.isSelected) $scope.dayCrons = $scope.dayCrons+','+data.num;
					});
					$scope.dayCrons = $scope.dayCrons.substr(1);
					$scope.isDay = false;$scope.isWeek = true;
				}
			};
			$scope.checkWeek = function(value){
				if(value==0){
					$scope.isWeek = true;
					$scope.weekCrons="*";
					angular.forEach($scope.weekList, function(data, key){
						data.isSelected = false;
					});
				}
				if(value==1) $scope.isWeek = false;
			};
			$scope.getWeek = function(num,isSelected){  //处理指定月
				if($scope.weekCrons == "*"){
					$scope.weekCrons = "";
					var conMin = conMin5 = [];
				}else{
					var conMin = $scope.weekCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin5.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin5.push(num);
					}
					angular.forEach($scope.weekList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) if(conMin[a]==num) conMin5.splice(a,1);
					}
					angular.forEach($scope.weekList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.weekCrons = conMin5.join(",");
				if($scope.weekCrons=="") $scope.weekCrons="*"; //如果什么都不选，则为“*”
			};
			
			$scope.ok = function(){
				//处理表达式
				if($scope.timedRule==0){
					$scope.addData.isDiy = true;
					if($scope.minuteRule==0){
						var num1 = parseInt($scope.minuteStart);var num2 = parseInt($scope.minuteEnd);
						if(($scope.minuteStart=="")|| ($scope.minuteEnd=="")){
							$scope.pop('请设定分钟的循环规则','error');
							return;
						}
						//检测是否为整数
						if(/^\d+$/.test($scope.minuteStart)==false){
							$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
							return;
						}
						if(/^\d+$/.test($scope.minuteEnd)==false){
							$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
							return;
						}
						if(num1>59||num1<0){
							$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
							return;
						}
						if(num2>50||num2<1){
							$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
							return;
						}
						$scope.crons = 0 + ' '+ $scope.minuteStart + '/' + $scope.minuteEnd+' '+$scope.hourCrons+' '+$scope.dayCrons+' '+$scope.monthCrons+' '+$scope.weekCrons;
					}
					if($scope.minuteRule==1){
						if($scope.conMinute=="*"){
							$scope.pop('请设定分钟的指定规则','error');
							return;
						}
						$scope.crons = 0 + ' '+ $scope.conMinute +' '+ $scope.hourCrons+' '+$scope.dayCrons+' '+$scope.monthCrons+' '+$scope.weekCrons;
					}
				}
				if($scope.timedRule==1){
					$scope.addData.isDiy = false;
					//var arrayList = $scope.crons.split(' ');
					//if(arrayList[1].indexOf('/')>0){
					//    var array1 = arrayList[1].split('/');
					//    var num1 = parseInt(array1[0]);var num2 = parseInt(array1[1]);
					//    if(num1>59||num1<0){
					//        $scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
					//        return;
					//    }
					//    if(num2>50||num2<1){
					//        $scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
					//        return;
					//    }
					//}
				}
				$scope.addData.crons = $scope.crons;
				if($scope.addData.crons==""){
					$scope.pop('请设定定时规则','error');
					return;
				}
				$scope.addData.kind = "BACKUP";
				httpLoad.loadData({
					url:'/cron/create',
					method:'POST',
					data: $scope.addData,
					success:function(data){
						if(data.success){
							//console.log($scope.addData);
							$scope.pop('定时任务添加成功');
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel');
			};
		}]);
	//编辑ctrl
	app.controller('updateTimedBackupModalCtrl',['$scope','$modalInstance','httpLoad','updateData','taskList',
		function($scope,$modalInstance,httpLoad,updateData,taskList){
			var aa=JSON.stringify(updateData);
			$scope.updateData=JSON.parse(aa);
			$scope.taskList = taskList;
			angular.forEach($scope.taskList, function(data, key){
				if(data.name==$scope.updateData.task.name) $scope.updateData.taskId=data.id;
			});
			
			$scope.hourRule = 0;$scope.dayRule =  0;$scope.monthRule =  0;
			$scope.minuteRule = 0;$scope.minuteStart = 1;$scope.minuteEnd = 5;$scope.conMinute = "*";
			$scope.everyweek = 0;
			$scope.minuteList = [];$scope.hourList = [];$scope.dayList = [];$scope.monthList = [];
			$scope.weekList = [{"day":"星期日","num":7,"isSelected":false},{"day":"星期一","num":1,"isSelected":false},{"day":"星期二","num":2,"isSelected":false},{"day":"星期三","num":3,"isSelected":false},{"day":"星期四","num":4,"isSelected":false},{"day":"星期五","num":5,"isSelected":false},{"day":"星期六","num":6,"isSelected":false}];
			$scope.weekCrons = "?";$scope.hourCrons = "*";$scope.dayCrons = "*";$scope.monthCrons = "*";
			$scope.isDay = true;$scope.isWeek = true;
			
			for(var i=0;i<60;i++) $scope.minuteList.push({"num":i,"isSelected":false});
			for(var j=0;j<24;j++) $scope.hourList.push({"num":j,"isSelected":false});
			for(var m=1;m<32;m++) $scope.dayList.push({"num":m,"isSelected":false});
			for(var n=1;n<13;n++) $scope.monthList.push({"num":n,"isSelected":false});
			//自定义
			if($scope.updateData.isDiy==false){
				$scope.crons = $scope.updateData.crons;
				$scope.timedRule = 1;
			}
			//勾选
			var conMin1 = [];var conMin2 = [];var conMin3 = [];var conMin4 = [];var conMin5 = [];
			if($scope.updateData.isDiy==true){
				$scope.crons = $scope.updateData.crons;
				$scope.timedRule = 0;
				//编辑数据的回显
				var cronArray = $scope.crons.split(' ');
				$scope.hourCrons = cronArray[2];$scope.dayCrons = cronArray[3];$scope.monthCrons = cronArray[4];$scope.weekCrons = cronArray[5];
				
				if(cronArray[1].indexOf('/')>0){
					$scope.minuteRule = 0;
					var dataList = cronArray[1].split('/');
					$scope.minuteStart = dataList[0];$scope.minuteEnd = dataList[1];
					$scope.conMinute = "*";
				}else{
					$scope.conMinute =  cronArray[1];
					conMin1 = $scope.conMinute.split(",");
					$scope.minuteRule = 1;
					var dataList = $scope.conMinute.split(',');
					angular.forEach($scope.minuteList, function(data, key){
						for(var a in dataList){
							if(data.num==dataList[a]) data.isSelected=true;
						}
					});
				}
				if(cronArray[2]=="*"){  //hour
					$scope.hourRule = 0;
				}else{
					$scope.hourRule = 1;
					var dataList = cronArray[2].split(',');
					angular.forEach($scope.hourList, function(data, key){
						for(var a in dataList){
							if(data.num==dataList[a]) data.isSelected=true;
						}
					});
				}
				if(cronArray[3]=="*"){  //day
					$scope.dayRule = 0;
					$scope.isDay = true;
				}else if(cronArray[3]=="?"){
					$scope.dayRule = 0;
					$scope.isDay = true;
				}else{
					$scope.isDay = false;
					$scope.dayRule = 1;
					var dataList = cronArray[3].split(',');
					angular.forEach($scope.dayList, function(data, key){
						for(var a in dataList){
							if(data.num==dataList[a]) data.isSelected=true;
						}
					});
				}
				if(cronArray[4]=="*"){  //month
					$scope.monthRule = 0;
				}else{
					$scope.monthRule = 1;
					var dataList = cronArray[4].split(',');
					angular.forEach($scope.monthList, function(data, key){
						for(var a in dataList){
							if(data.num==dataList[a]) data.isSelected=true;
						}
					});
				}
				if(cronArray[5]=="*"){  //week
					$scope.weekRule = true;
					$scope.everyweek = 0;
					$scope.isWeek=true;
				}else if(cronArray[5]=="?"){
					$scope.weekRule = false;
					$scope.everyweek = 0;
					$scope.isWeek=true;
				} else{
					$scope.weekRule = true;$scope.isWeek=false;
					$scope.everyweek = 1;
					var dataList = cronArray[54].split(',');
					angular.forEach($scope.weekList, function(data, key){
						for(var a in dataList){
							if(data.num==dataList[a]) data.isSelected=true;
						}
					});
				}
			}
			
			//分钟
			$scope.getConMinute = function(num,isSelected){  //处理指定分钟
				console.log($scope.conMinute);
				if($scope.conMinute == "*"){
					$scope.conMinute = "";
					var conMin = [];
				}else{
					var conMin = $scope.conMinute.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin1.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]==num) b = 2;
						}
						if(b==1) conMin1.push(num);
					}
					angular.forEach($scope.minuteList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) conMin1.splice(a,1);
					}
					angular.forEach($scope.minuteList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.conMinute = conMin1.join(",");
				if($scope.conMinute=="") $scope.conMinute="*"; //如果什么都不选，则为“*”
			};
			$scope.checkMinute = function(value){   //设定分钟规则
				$scope.minuteRule = value;
			};
			$scope.checkcircleMinute = function(value,index){
				var num = parseInt(value);
				if(index==0){
					$scope.minuteStart = value;
					//检测是否为整数
					if(/^\d+$/.test($scope.minuteStart)==false){
						$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
						return;
					}
					if(num>59||num<0){
						$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
						return;
					}
				}
				if(index==1){
					$scope.minuteEnd = value;
					//检测是否为整数
					if(/^\d+$/.test($scope.minuteEnd)==false){
						$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
						return;
					}
					if(num>50||num<1){
						$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
						return;
					}
				}
			};
			
			//小时
			$scope.checkHour = function(value){
				$scope.hourRule = value;
				if(value==0){
					$scope.hourCrons="*";
					angular.forEach($scope.hourList, function(data, key){
						data.isSelected = false;
					});
				}
			};
			$scope.getHour = function(num,isSelected){  //处理指定小时
				if($scope.hourCrons == "*"){
					$scope.hourCrons = "";
					var conMin = conMin2 = [];
				}else{
					var conMin = $scope.hourCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin2.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin2.push(num);
					}
					angular.forEach($scope.hourList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) conMin2.splice(a,1);
					}
					angular.forEach($scope.hourList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.hourCrons = conMin2.join(",");
				if($scope.hourCrons=="") $scope.hourCrons="*"; //如果什么都不选，则为“*”
			};
			
			//天
			$scope.checkDay = function(value){
				$scope.dayRule = value;
				if(value==0){
					$scope.isDay = true;$scope.weekRule =false;$scope.isWeek=false;
					$scope.dayCrons="*";$scope.weekCrons="?";
					angular.forEach($scope.dayList, function(data, key){
						data.isSelected = false;
					});
				}
				if(value==1){
					$scope.isDay = false;
					$scope.weekCrons = "?";$scope.weekRule = false;$scope.isWeek = true;
				}
			};
			$scope.getDay = function(num,isSelected){  //处理指定天
				if($scope.dayCrons == "*"){
					$scope.dayCrons = "";
					var conMin = conMin3 = [];
				}else{
					var conMin = $scope.dayCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin3.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin3.push(num);
					}
					angular.forEach($scope.dayList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) conMin3.splice(a,1);
					}
					angular.forEach($scope.dayList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.dayCrons = conMin3.join(",");
				if($scope.dayCrons=="") $scope.dayCrons="*"; //如果什么都不选，则为“*”
			};
			
			//月
			$scope.checkMonth = function(value){
				$scope.monthRule = value;
				if(value==0){
					$scope.monthCrons="*";
					angular.forEach($scope.monthList, function(data, key){
						data.isSelected = false;
					});
				}
			};
			$scope.getMonth = function(num,isSelected){  //处理指定月
				if($scope.monthCrons == "*"){
					$scope.monthCrons = "";
					var conMin = conMin4 = [];
				}else{
					var conMin = $scope.monthCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin4.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin4.push(num);
					}
					angular.forEach($scope.monthList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) conMin4.splice(a,1);
					}
					angular.forEach($scope.monthList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.monthCrons = conMin4.join(",");
				if($scope.monthCrons=="") $scope.monthCrons="*"; //如果什么都不选，则为“*”
			};
			
			//星期
			$scope.checkWeekRule = function(){
				var value = !$scope.weekRule;
				if(value==true) {
					$scope.dayCrons = "?";$scope.weekCrons = "*";
					angular.forEach($scope.weekList, function(data, key){
						data.isSelected = false;
					});
					$scope.isDay = true;$scope.isWeek = true;
				}else{
					if($scope.dayCrons=="*") return;
					$scope.dayCrons = "";$scope.weekCrons = "?";
					angular.forEach($scope.dayList, function(data, key){
						if(data.isSelected) $scope.dayCrons = $scope.dayCrons+','+data.num;
					});
					$scope.dayCrons = $scope.dayCrons.substr(1);
					$scope.isDay = false;$scope.isWeek = true;
				}
			};
			$scope.checkWeek = function(value){
				if(value==0){
					$scope.isWeek = true;
					$scope.weekCrons="*";
					angular.forEach($scope.weekList, function(data, key){
						data.isSelected = false;
					});
				}
				if(value==1) $scope.isWeek = false;
			};
			$scope.getWeek = function(num,isSelected){  //处理指定月
				if($scope.weekCrons == "*"){
					$scope.weekCrons = "";
					var conMin = conMin5 = [];
				}else{
					var conMin = $scope.weekCrons.split(",");
				}
				
				if(isSelected){
					if(conMin.length==0) conMin5.push(num);
					else{
						var b = 1;
						for(var a in conMin){
							if(conMin[a]!=num) b = 2;
						}
						if(b==2) conMin5.push(num);
					}
					angular.forEach($scope.weekList, function(data, key){
						if(data.num==num) data.isSelected=true;
					});
				}else{
					for(var a in conMin){
						if(conMin[a]==num) conMin5.splice(a,1);
					}
					angular.forEach($scope.weekList, function(data, key){
						if(data.num==num) data.isSelected=false;
					});
				}
				$scope.weekCrons = conMin5.join(",");
				if($scope.weekCrons=="") $scope.weekCrons="*"; //如果什么都不选，则为“*”
			};
			
			$scope.ok = function(){
				//处理表达式
				if($scope.timedRule==0){
					if($scope.minuteRule==0){
						var num1 = parseInt($scope.minuteStart);var num2 = parseInt($scope.minuteEnd);
						if(($scope.minuteStart=="")|| ($scope.minuteEnd=="")){
							$scope.pop('请设定分钟的循环规则','error');
							return;
						}
						//检测是否为整数
						if(/^\d+$/.test($scope.minuteStart)==false){
							$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
							return;
						}
						if(/^\d+$/.test($scope.minuteEnd)==false){
							$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
							return;
						}
						if(num1>59||num1<0){
							$scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
							return;
						}
						if(num2>50||num2<1){
							$scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
							return;
						}
						$scope.crons = 0 + ' '+ $scope.minuteStart + '/' + $scope.minuteEnd+' '+$scope.hourCrons+' '+$scope.dayCrons+' '+$scope.monthCrons+' '+$scope.weekCrons;
					}
					if($scope.minuteRule==1){
						if($scope.conMinute=="*"){
							$scope.pop('请设定分钟的指定规则','error');
							return;
						}
						$scope.crons = 0 + ' '+ $scope.conMinute +' '+ $scope.hourCrons+' '+$scope.dayCrons+' '+$scope.monthCrons+' '+$scope.weekCrons;
					}
				}
				if($scope.timedRule==1){
					if($scope.crons==""){
						$scope.pop('请输入定时规则','error');
						return;
					}
					//var arrayList = $scope.crons.split(' ');
					//if(/^\d+$/.test(arrayList[0])==false){
					//    $scope.pop('秒为0-59的整数，请重新输入','error');
					//    return;
					//}
					//if(parseInt(arrayList[0])>59||parseInt(arrayList[0])<0){
					//    $scope.pop('秒为0-59的整数，请重新输入','error');
					//    return;
					//}
					//if(arrayList[1].indexOf('/')>0){
					//    var array1 = arrayList[1].split('/');
					//    var num1 = parseInt(array1[0]);var num2 = parseInt(array1[1]);
					//    if(($scope.minuteStart=="")|| ($scope.minuteEnd=="")){
					//        $scope.pop('请设定分钟的循环规则','error');
					//        return;
					//    }
					//    //检测是否为整数
					//    if(/^\d+$/.test($scope.minuteStart)==false){
					//        $scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
					//        return;
					//    }
					//    if(/^\d+$/.test($scope.minuteEnd)==false){
					//        $scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
					//        return;
					//    }
					//    if(num1>59||num1<0){
					//        $scope.pop('分钟开始时间为0-59的整数，请重新输入','error');
					//        return;
					//    }
					//    if(num2>50||num2<1){
					//        $scope.pop('分钟执行间隔为1-50的整数，请重新输入','error');
					//        return;
					//    }
					//}
				}
				$scope.updateData.crons = $scope.crons;
				if($scope.updateData.crons==""){
					$scope.pop('请设定定时规则','error');
					return;
				}
				
				httpLoad.loadData({
					url:'/cron/modify',
					method:'POST',
					data: $scope.updateData,
					success:function(data){
						if(data.success){
							//console.log($scope.updateData);
							$scope.pop('定时任务编辑成功');
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel');
			};
		}]);
	//删除ctrl
	app.controller('removeTimedBackupModalCtrl',['$scope','$modalInstance','httpLoad','removeData','timedOperationList','index',
		function($scope,$modalInstance,httpLoad,removeData,timedOperationList,index){
			$scope.ok = function(){
				httpLoad.loadData({
					url:'/cron/remove',
					method:'POST',
					data: removeData,
					success:function(data){
						if(data.success){
							//console.log(removeData);
							$scope.pop('定时任务删除成功');
							$modalInstance.close();
						}
					}
				});
			};
			$scope.cancel = function(){
				$modalInstance.dismiss('cancel');
			};
		}]);
	app.controller('BackupHistoryCtrl', ['$rootScope', '$scope', 'httpLoad', '$modal', function($rootScope, $scope, httpLoad, $modal) {
		$scope.param = {
			page: 1,
			rows: 10,
			params: angular.toJson([{param:{kind:'BACKUP'},sign:'EQ'}])
		};
		$scope.getList = function(page){
			if(page == 1) $rootScope.moduleTitle = '日常作业 > 备份记录';
			$scope.param.page = page || $scope.param.page;
			httpLoad.loadData({
				url: '/record/graph/list',
				data: $scope.param,
				noParam: true,
				success: function(data){
					$scope.listData = data.data.rows;
					$scope.totalPage = data.data.total;
				}
			});
			
		};
		$scope.recovery = function(id){
			httpLoad.loadData({
				url: '/task/graph/recover',
				data: {id: id},
				success: function(data){
					if(data.success){
						$scope.goTaskDetail(data.data);
					}
				}
			});
		};
		$scope.getFileList = function(id){
			$modal.open({
				templateUrl: '/statics/tpl/operation/backupRecovery/fileListModal.html',
				controller: 'fileListModalCtrl',
				backdrop: 'static',
				resolve: {
					id: function() {
						return  id;
					},
				}
			});
		};
		//对参数进行处理，去除空参数
		var toObjFormat = function(obj) {
			for (var a in obj) {
				if (obj[a] == "") delete obj[a];
			}
			return obj;
		}
		//搜索
		$scope.search = function(){
			//对时间进行处理
			var toFormatTime = function(time, place) {
				if (!time) return "";
				var date = time.split(' - ');
				return date[place/1];
			}
			var params = [];
			var param1 = toObjFormat({
				name: $scope.name
				
			});
			var param2 = toObjFormat({
				kind: 'BACKUP'
			});
			if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
			if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
			if ($scope.date) {
				params.push({param: {gmtCreate: toFormatTime($scope.date, 0)}, sign: 'GET'});
				params.push({param: {gmtCreate: toFormatTime($scope.date, 1)}, sign: 'LET'});
			}
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson(params)
			}
			$scope.getList()
		}
		//重置搜索条件
		$scope.reset = function(){
			var obj = ['name'];
			angular.forEach(obj,function(data){
				$scope[data] = '';
			})
		}
	}]);
	//下载文件ctrl
	app.controller('fileListModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
		function($scope, $modalInstance, httpLoad, id) {
			$scope.itemsByPage = 5;
			(function () {
				httpLoad.loadData({
					url: '/record/graph/successes',
					method:'GET',
					data: {
						id:id
					},
					success: function(data){
						$scope.listData = data.data;
						$scope.total = data.data.length;
					}
				});
			})();
			$scope.download = function (path) {
				httpLoad.loadData({
					url: '/record/graph/check',
					data: {
						path:path
					},
					success: function(data){
						if(data.success){
							var params = JSON.stringify({path:path})
							location.href = '/record/graph/download?params='+ params;
						}
					}
				});
			}
			$scope.cancle = function(){
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	app.controller('RecorveryHistoryCtrl', ['$rootScope', '$scope', 'httpLoad', function($rootScope, $scope, httpLoad) {
		$scope.param = {
			page: 1,
			rows: 10,
			params: angular.toJson([{param:{kind:'RECOVERY'},sign:'EQ'}])
		};
		$scope.getList = function(page){
			$rootScope.moduleTitle = '日常作业 > 恢复记录';
			$scope.param.page = page || $scope.param.page;
			httpLoad.loadData({
				url: '/record/graph/list',
				data: $scope.param,
				noParam: true,
				success: function(data){
					$scope.listData = data.data.rows;
					$scope.totalPage = data.data.total;
				}
			});
			
		};
		//对参数进行处理，去除空参数
		var toObjFormat = function(obj) {
			for (var a in obj) {
				if (obj[a] == "") delete obj[a];
			}
			return obj;
		}
		//搜索
		$scope.search = function(){
			//对时间进行处理
			var toFormatTime = function(time, place) {
				if (!time) return "";
				var date = time.split(' - ');
				return date[place/1];
			}
			var params = [];
			var param1 = toObjFormat({
				name: $scope.name,
				
			});
			var param2 = toObjFormat({
				status:$scope.status,
				mode: $scope.mode,
				kind: 'RECOVERY'
			});
			if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
			if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
			if ($scope.date) {
				params.push({param: {gmtCreate: toFormatTime($scope.date, 0)}, sign: 'GET'});
				params.push({param: {gmtCreate: toFormatTime($scope.date, 1)}, sign: 'LET'});
			}
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson(params)
			}
			$scope.getList()
		}
		//重置搜索条件
		$scope.reset = function(){
			var obj = ['name'];
			angular.forEach(obj,function(data){
				$scope[data] = '';
			})
		}
	}]);
})();
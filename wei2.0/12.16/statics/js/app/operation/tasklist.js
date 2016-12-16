/**
 * Created by Zhang Haijun on 2016/6/16.
 */
(function(){
	"use strict";
	app.service('TaskData', function() {
		var service = {
			//定义任务状态
			statusModeData:{
				1: '未执行',
				2: '正在执行',
				3: '执行成功',
				4: '执行失败',
				5: '跳过',
				6: '忽略错误',
				7: '等待用户',
				8: '手动结束',
				9: '状态异常'
			},
			//定义启动方式
			startWaysData:{
				1: '页面执行',
				2: 'API调用',
				3: '定时执行'
			},
		};
		return service;
	});
	app.controller('TaskListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','TaskData','$state',
		function($scope, httpLoad, $rootScope, $modal, $timeout, TaskData, $state) {
			$rootScope.moduleTitle = '日常作业 > 作业执行';//定义当前页
			$scope.statusModeData = TaskData.statusModeData;
			$scope.startWaysData = TaskData.startWaysData;
			//获取脚本列表数据
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson([{param:{kind:'GENERAl'},sign:'EQ'}])
			}
			$scope.getTaskList = function(page){
				$scope.param.page = page || $scope.param.page;
				httpLoad.loadData({
					url:'/task/graph/list',
					method:'POST',
					noParam: true,
					data:$scope.param,
					success:function(data){
						if(data.success){
							$scope.historyListData = data.data.rows;
							$scope.totalPage = data.data.total;
						}
					}
				});
			}
			$scope.getTaskList();
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
				}
				var params = [];
				var param1 = toObjFormat({
					name:$scope.name
				});
				var param2 = toObjFormat({
					kind: 'GENERAl',
					createrId: $scope.createrId || $scope.creator,
					menderId: $scope.menderId || $scope.mender
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
				$scope.getTaskList(1)
			}
			//重置搜索条件
			$scope.reset = function(){
				var obj = ['name','creator','createrId','date','mender','menderId'];
				angular.forEach(obj,function(data){
					$scope[data] = '';
				})
			}
			//自动填充创建人
			$scope.autoComplete = function(flag){
				if(flag){
					$scope.creator = $rootScope.userData.username;
				}else $scope.mender = $rootScope.userData.username
				
			}
			$scope.goEdit = function(id,flag){
						$state.go('app.operation.newtask',{
							flag:flag,
							id:id
						});
					};
			$scope.remove = function (id){
				var modalInstance = $modal.open({
					templateUrl: '/statics/tpl/operation/tasklist/delTaskModal.html',
					controller: 'delTaskModalCtrl',
					backdrop: 'static',
					resolve: {
						id: function() {
							return  id;
						}
					}
				});
				modalInstance.result.then(function() {
					$scope.getTaskList();
				});
			};
			$scope.createTimeTask = function (item) {
				$modal.open({
					templateUrl : '/statics/tpl/operation/tasklist/addTimeTaskModal.html',
					controller : 'addTimedGeneralModalCtrl',
					resolve : {
						item : function(){
							return item;
						}
					}
				});
			}
		}
	]);
	//删除任务ctrl
	app.controller('delTaskModalCtrl', ['$scope', '$modalInstance', 'httpLoad', 'id',
		function($scope, $modalInstance, httpLoad, id) {
			$scope.ok = function(){
				httpLoad.loadData({
					url: '/task/graph/remove',
					data: {id: id},
					success: function(data){
						if(data.success){
							$scope.pop('删除成功');
							$modalInstance.close();
						}
					}
				});
			}
			$scope.cancle = function(){
				$modalInstance.dismiss('cancel');
			};
		}
	]);
	//新增定时ctrl
	app.controller('addTimedGeneralModalCtrl',['$scope','$modalInstance','httpLoad','item',
		function($scope,$modalInstance,httpLoad,item){
		    $scope.taskName = item.name; 
			$scope.addData={
				name:item.name,
				taskId:item.id,
				kind:'GENERAl'
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
})()
/**
 * Created by Yang Zhenrong on 2016/11/02.
 */
(function(){
	app.controller('CustomEsLogCtrl', ['$rootScope', '$scope','$modal','$state', 'httpLoad', 
	    function($rootScope, $scope,$modal,$state, httpLoad) {
		$rootScope.moduleTitle = '日志管理 > 日志检索 ';
		(function(){
			httpLoad.loadData({
				url: '/log/checkRole',
				noParam: true,
				success: function(data){
					if(data.success){
						if(data.data){
							document.getElementById("tenantDiv").style.display="block";
							document.getElementById("tenantDiv").style.width="48%";
							document.getElementById("tenantDiv").style.float="left";
						}
					}
				}
			});
			httpLoad.loadData({
				url: '/log/getTenantList',
				noParam: true,
				success: function(data){
					if(data.success){
						$scope.tenantListData = data.data;
					}
				}
			});
			httpLoad.loadData({
				url: '/log/getLoglevel',
				noParam: true,
				success: function(data){
					if(data.success){
						$scope.loglevelListData = data.data;
					}
				}
			});
			httpLoad.loadData({
				url: '/log/eslogindex/list',
				noParam: true,
				success: function(data){
					if(data.success){
						$scope.indexListData = data.data.rows;
					}
				}
			});
			httpLoad.loadData({
				url: '/log/eslogtype/list',
				noParam: true,
				success: function(data){
					if(data.success){
						$scope.typeListData = data.data.rows;
					}
				}
			});
		})();
		//对时间进行处理
		var toFormatTime = function(time, place) {
			if (!time) return "";
			var date = time.split(' - ');
			return date[place/1];
		}
		$scope.param = {
			page: 1,
			rows: 10
		}
		$scope.getList = function(page){
			$scope.param.page = page || $scope.param.page;
			httpLoad.loadData({
				url: '/log/eslogcustom/list',
				data: $scope.param,
				noParam: true,
				success: function(data){
					if(data.success){
						$scope.listData = data.data.rows;
						$scope.totalPage = data.data.total;
					}
				}
			});
		};
		$scope.dateAdd = function(nd,days){
			nd = nd.valueOf();
			nd = nd + days * 24 * 60 * 60 * 1000;
			return new Date(nd);
		};
		
		$scope.dateChange = function(date) {
			var nd = new Date(date);
			var y = nd.getFullYear();
			var m = nd.getMonth()+1;
			var d = nd.getDate();
			var h = nd.getHours();
			var mm = nd.getMinutes();
			var s = nd.getSeconds();
			if(m <= 9) m = "0"+m;
			if(d <= 9) d = "0"+d; 
			if(h <= 9) h = "0"+h;
			if(mm <= 9) mm = "0"+mm;
			if(s <= 9) s = "0"+s;
			var cdate = y+"-"+m+"-"+d+" "+h+":"+mm+":"+s;
			return cdate;
		};
		var dateNow = new Date();
		$scope.datechange = function(){
			if($scope.datecondition==""){
				$scope.date="";
			}else{
				if($scope.date==""||$scope.date==undefined)
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,-6)) + " - " + $scope.dateChange(dateNow);
			}
		};
		$scope.indexchange = function(){
			if($scope.indexcondition=="")
			$scope.index="";
		};
		$scope.typechange = function(){
			if($scope.typecondition=="")
			$scope.type="";
		};
		$scope.logflagchange = function(){
			if($scope.logflagcondition=="")
			$scope.logflag="";
		};
		
		$scope.hostchange = function(){
			if($scope.hostcondition=="")
			$scope.host="";
		};
		$scope.loglevelchange = function(){
			if($scope.loglevelcondition=="")
			$scope.loglevel="";
		};
		$scope.messagechange = function(){
			if($scope.messagecondition=="")
			$scope.message="";
		};
		$scope.custonchange = function(){
			if($scope.customcondition=="")
			$scope.customvalue="";
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
			var params = [];
			var param1 = toObjFormat({
				index: $scope.index,
				type: $scope.type,
				datecondition:$scope.datecondition,
				indexcondition:$scope.indexcondition,
				typecondition:$scope.typecondition,
				logflagcondition:$scope.logflagcondition,
				hostcondition:$scope.hostcondition,
				loglevelcondition:$scope.loglevelcondition,
				messagecondition:$scope.messagecondition,
				loglevel:$scope.loglevel,
				custom:$scope.custom,
				customvalue:$scope.customvalue,
				customcondition:$scope.customcondition,
				tenantid: $scope.tenantid
			});
			var param2 = toObjFormat({
				host: $scope.host,
				logflag:$scope.logflag,
				message: $scope.message
			});
			params.push({param: param1, sign: 'EQ'});
			if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'LK'});
			if ($scope.date) {
				params.push({param: {timestamp: toFormatTime($scope.date, 0)}, sign: 'GET'});
				params.push({param: {timestamp: toFormatTime($scope.date, 1)}, sign: 'LET'});
			}
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson(params)
			}
			$scope.getList();
		}
		$scope.export = function(){
			var params = [];
			var param1 = toObjFormat({
				index: $scope.index,
				type: $scope.type,
				datecondition:$scope.datecondition,
				indexcondition:$scope.indexcondition,
				typecondition:$scope.typecondition,
				logflagcondition:$scope.logflagcondition,
				hostcondition:$scope.hostcondition,
				loglevelcondition:$scope.loglevelcondition,
				messagecondition:$scope.messagecondition,
				loglevel:$scope.loglevel,
				custom:$scope.custom,
				customvalue:$scope.customvalue,
				customcondition:$scope.customcondition,
				tenantid: $scope.tenantid
			});
			var param2 = toObjFormat({
				host: $scope.host,
				logflag:$scope.logflag,
				message: $scope.message
			});
			params.push({param: param1, sign: 'EQ'});
			if (angular.toJson(param2).length > 2) 
				params.push({param: param2, sign: 'LK'});
			if ($scope.date) {
				params.push({param: {timestamp: toFormatTime($scope.date, 0)}, sign: 'GET'});
				params.push({param: {timestamp: toFormatTime($scope.date, 1)}, sign: 'LET'});
			}
        	document.getElementById("eslogexport").setAttribute("src","/logexport/eslogcustom/export?params="+angular.toJson(params));

		}
		//重置搜索条件
		$scope.reset = function(){
			var obj = ['datecondition','indexcondition','typecondition','logflagcondition','hostcondition','loglevelcondition','messagecondition','custom','customcondition','customvalue','date','index','type','logflag','host','loglevel','message','tenantid'];
			angular.forEach(obj,function(data){
				$scope[data] = '';
			});
		}
		 $scope.detail = function(item){  //打开模态
             var modalInstance = $modal.open({
                 templateUrl : '/statics/tpl/log/eslogdetail.html',  //指向上面创建的视图
                 controller : 'detailLogModalCtrl',// 初始化模态范围
                 resolve : {
                     itemData: function() {
                         return item;
                     }
                 }
             });
             modalInstance.result.then(function(data){
                 angular.extend(item,data);
             },function(){});
         };
       //本周
			$scope.currWeek = function(){
				if($scope.datecondition==""||$scope.datecondition==undefined){
					$scope.datecondition="must";
				}
				var dateNow = new Date();
				var weekDay = dateNow.getDay();
				if (0 == weekDay) {
					weekDay = 7;
				}
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,1-weekDay)) + " - " + $scope.dateChange(dateNow);
				$scope.search();
			}
			//上周
			$scope.preWeek = function(){
				if($scope.datecondition==""||$scope.datecondition==undefined){
					$scope.datecondition="must";
				}
				var dateNow = new Date();
				var weekDay = dateNow.getDay();
				if (0 == weekDay) {
					weekDay = 7;
				}
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,-weekDay-6)) + " - " + $scope.dateChange($scope.dateAdd(dateNow,-weekDay));
				$scope.search();
			}
			
			//本月 本月的第一天到当前时间
			$scope.currMonth = function(){
				if($scope.datecondition==""||$scope.datecondition==undefined){
					$scope.datecondition="must";
				}
				var dateNow = new Date();
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,1-dateNow.getDate())) + " - " + $scope.dateChange(dateNow);
				$scope.search();
			}   
			
			//上月  //new Date().getDay()
			$scope.preMonth = function(){
				if($scope.datecondition==""||$scope.datecondition==undefined){
					$scope.datecondition="must";
				}
				var dateNow = new Date();
				var preMathDate = $scope.dateAdd(dateNow,-dateNow.getDate());
				$scope.date = $scope.dateChange($scope.dateAdd(preMathDate,1-preMathDate.getDate())) + " - " + $scope.dateChange(preMathDate);
				$scope.search();
			}
			
			//7天  //new Date().getDay()
			$scope.sevenDays= function(){
				if($scope.datecondition==""||$scope.datecondition==undefined){
					$scope.datecondition="must";
				}
				var dateNow = new Date();
				var preMathDate = $scope.dateAdd(dateNow,-dateNow.getDate());
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,-6)) + " - " + $scope.dateChange(dateNow);
				$scope.search();
			}
		
			//15天 //new Date().getDay()
			$scope.fifteenDays = function(){
				if($scope.datecondition==""||$scope.datecondition==undefined){
					$scope.datecondition="must";
				}
				var dateNow = new Date();
		        $scope.date = $scope.dateChange($scope.dateAdd(dateNow,-14)) + " - " + $scope.dateChange(dateNow);
				$scope.search();
			}
		
			//30天  //new Date().getDay()
			$scope.thirtyDays = function(){
				if($scope.datecondition==""||$scope.datecondition==undefined){
					$scope.datecondition="must";
				} 
				var dateNow = new Date();
				$scope.date = $scope.dateChange($scope.dateAdd(dateNow,-29)) + " - " + $scope.dateChange(dateNow);
				$scope.search();
			}		
	}]);
	angular.module('app').controller('detailLogModalCtrl',['$scope','$modalInstance','itemData','LANGUAGE','httpLoad',
           function($scope,$modalInstance,itemData,LANGUAGE,httpLoad){ //依赖于modalInstance
		   $scope.logDetailData=itemData;
           $scope.cancel = function(){
               $modalInstance.dismiss('cancel'); // 退出
           };
    }]);
})();
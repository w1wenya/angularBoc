/**
 * Created by Zhang Haijun on 2016/8/11.
 */
(function(){
	var _checkedIds = [];
	var _parentScope;
	app.controller('IndexMngCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','LANGUAGE',
	 function($scope, httpLoad, $rootScope, $modal,$state, $timeout,LANGUAGE) {
 
		$rootScope.moduleTitle = '日志管理 > 索引管理';
		_parentScope = $scope;
		$scope.param = { 
			page: 1, 
			rows: 10,
			params : angular.toJson([{param: {isDeleted:'0'}, sign: 'LK'}])
		};
		$scope.getList = function(page){
			_checkedIds = [];
			$scope.param.page = page || $scope.param.page;
			httpLoad.loadData({
				url: '/indexmng/logIndex/list',
				method:'POST',
				data: $scope.param,
				noParam: true,
				success: function(data){
					$scope.listData = data.data.rows;
					$scope.totalPage = data.data.total;
				}
			});			
		};
		$scope.getList(1);
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
				status: $scope.status,
				backupStatus: $scope.backupStatus,
				archiveStatus: $scope.fileStatus,
				isDeleted:'0'
			});
			if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'EQ'});
			if ($scope.gmtTime) {
				params.push({param: {gmtCreate: toFormatTime($scope.gmtTime, 0)}, sign: 'GET'});
				params.push({param: {gmtCreate: toFormatTime($scope.gmtTime, 1)}, sign: 'LET'});
			}
			if ($scope.backupTime) {
				params.push({param: {lastBackup: toFormatTime($scope.backupTime, 0)}, sign: 'GET'});
				params.push({param: {lastBackup: toFormatTime($scope.backupTime, 1)}, sign: 'LET'});
			}
			if ($scope.fileTime) {
				params.push({param: {lastArchive: toFormatTime($scope.fileTime, 0)}, sign: 'GET'});
				params.push({param: {lastArchive: toFormatTime($scope.fileTime, 1)}, sign: 'LET'});
			}
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson(params)
			};
			$scope.getList();
		}
		
		$scope.isCheck = function($event,id) {
			 var checkbox = $event.target; 
			 var action = (checkbox.checked?'add':'remove'); 
			 updateSelected(action,id); 
		};
		var updateSelected = function(action,id){ 
		    if(action == 'add' && _checkedIds.indexOf(id) == -1){ 
		      _checkedIds.push(id); 
		    } 
		    if(action == 'remove' && _checkedIds.indexOf(id)!=-1){ 
		      var idx = _checkedIds.indexOf(id); 
		      _checkedIds.splice(idx,1); 
		    } 
	    } 
		
		//--查看索引操作记录--------------
        $scope.showdetail = function(item){  //打开模态
            var modalInstance = $modal.open({
                templateUrl : '/statics/tpl/log/indexDetail.html',  //指向上面创建的视图
                controller : 'indexDetailCtrl',// 初始化模态范围
                resolve : {
                     itemData: function() {
                        return item;
                    } 
                }
            });
            modalInstance.result.then(function(data){
               // angular.extend(item,data);
            },function(){});
        };
		//------------------------------------
        /**
		  * 同步索引
		  */
		$scope.synIndex = function(){  //打开模态		 
			 var dataparam = {
						page: 1,
						rows: 10,
						params:[{"param":{"name":"i"},"sign":"LK"}]  
			};
			dataparam = {};
			httpLoad.loadData({
	            url:'/indexmng/logIndex/sysIndex',
	            method:'POST',
	            data: dataparam,    //传递数据 
	            noParam: true,
	            success:function(data){
	            	$scope.search();	            	        
	            }
	        }); 
        } 
		/**
		  * 索引删除确认
		  */
	   $scope.delIndex = function(id){  //打开模态		 
          
           if (!_checkedIds || 0 == _checkedIds.length) {
      		 $scope.pop('请选择待删除记录。','error');
      		 return;
      	   }            
           var modalInstance = $modal.open({
               templateUrl : '/statics/tpl/log/indexdelete.html',
               controller : 'deleteModalCtrl',
               resolve : {
                   id: function() {
                       return  id;
                   }
               }
           });
          
           modalInstance.result.then(function(){
           },function(){});
       } 
       
		 /**
		  * 索引备份确认
		  */
		 $scope.backup = function(id){  //打开模态
			 //校验是否选中记录
			 if (!_checkedIds || 0 == _checkedIds.length) {
        		 $scope.pop('请选择待备份记录。','error');
        		 return;
        	 } 
			 
	         var modalInstance = $modal.open({
                 templateUrl : '/statics/tpl/log/indexbackup.html',
                 controller : 'backupModalCtrl',
                 resolve : {
                     id: function() {
                         return  id;
                     }
                 }
             });
             modalInstance.result.then(function(){
             },function(){});
         } 
		 
		 /**
		  * 索引归档确认
		  */
		 $scope.file = function(id){  //打开模态
			 if (!_checkedIds || 0 == _checkedIds.length) {
           		 $scope.pop('请选择待归档记录。','error');
           		 return;
           	 }		 	 
			 
	         var modalInstance = $modal.open({
                 templateUrl : '/statics/tpl/log/indexfile.html',
                 controller : 'fileModalCtrl',
                 resolve : {
                     id: function() {
                         return  id;
                     }
                 }
             });
             modalInstance.result.then(function(){
             },function(){});
         } 
		 
		 //打开索引操作记录
         $scope.showoperation = function($event,id){
             $event.stopPropagation();
             $state.go('app.log.indexOperation',{id:id});
         }; 
         
        //打开索引明细页面
         $scope.showDetail = function($event,id){
             $event.stopPropagation();
             $state.go('app.log.indexDetail',{id:id});
         }; 
		
        /*$scope.exportExcel = function(){
        	document.getElementById("frm_baidu").setAttribute("src","http://www.xxxxx.com");
 		} */
         
		$scope.reset = function(){
			var obj = ['gmtCreate','status','backupStatus','backupTime','fileTime','fileStatus'];
			angular.forEach(obj,function(data){
				$scope[data] = '';
			})
		}
	}]);
	
	 /**
	  * 索引删除
	  */
	angular.module('app').controller('deleteModalCtrl',['$scope','$modalInstance','id','LANGUAGE','httpLoad',
         function($scope,$modalInstance,id,LANGUAGE,httpLoad){ //依赖于modalInstance
             $scope.ok = function(){            	  
           	  var dataparam = {
     					params: _checkedIds.join(',')
     		     };
           	 $modalInstance.dismiss('cancel'); // 退出            
	            //dataparam = {};
	            httpLoad.loadData({
	 	            url:'/indexmng/logIndex/remove',
	 	            method:'POST',
	 	            data: dataparam,    //传递数据 
	 	            noParam: true,
	 	            success:function(data){
	 	            	_parentScope.search();	            	        
	 	            }
	 	        }); 	  
           	 
             };
             $scope.cancel = function(){
                 $modalInstance.dismiss('cancel'); // 退出
             }
     }]);
	
	 /**
	  * 索引备份
	  */
	angular.module('app').controller('backupModalCtrl',['$scope','$modalInstance','id','LANGUAGE','httpLoad',
          function($scope,$modalInstance,id,LANGUAGE,httpLoad){ //依赖于modalInstance
              $scope.ok = function(){            	  
            	  var dataparam = {
      					params: _checkedIds.join(',')
      		     };
            	  $modalInstance.dismiss('cancel'); // 退出            	 
            	  httpLoad.loadData({
      	            url:'/indexmng/logIndex/backup',
      	            method:'POST',
      	            data: dataparam,    //传递数据 
      	            noParam: true,
      	            success:function(data){    
      	            	showMessage($scope,data);
      	            	_parentScope.search();	   
      	            }
      	        });             	  
              };
              $scope.cancel = function(){
                  $modalInstance.dismiss('cancel'); // 退出
              }
      }]);
	
	/**
	  *索引归档
	  */
	angular.module('app').controller('fileModalCtrl',['$scope','$modalInstance','id','LANGUAGE','httpLoad',
        function($scope,$modalInstance,id,LANGUAGE,httpLoad){ //依赖于modalInstance
            $scope.ok = function(){
            	$modalInstance.dismiss('cancel');             	
            	  var dataparam = {
        					params: _checkedIds.join(',')
        		     };
              	  httpLoad.loadData({
        	            url:'/indexmng/logIndex/archive',
        	            method:'POST',
        	            data: dataparam,    //传递数据 
        	            noParam: true,
        	            success:function(data){      	            	 
        	            	showMessage($scope,data);
        	            	_parentScope.search();	   
        	            }
        	        });             	  
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
    }]);
	
	//--索引操作记录展示、包含主表和明细表                         IndexOperationCtrl
	angular.module('app').controller('indexDetailCtrl',['$scope','$modalInstance','itemData','LANGUAGE','httpLoad',
      function($scope,$modalInstance,itemData,LANGUAGE,httpLoad){ //依赖于modalInstance	
		/*$scope.param = {
				page: 1,
				rows: 5,
				params:angular.toJson([{"param":{"indexId":itemData.id},"sign":"EQ"}])
			};
		httpLoad.loadData({
            url:'/indexmng/logIndexOp/list',
            method:'POST',
            data: $scope.param,    //传递数据 
            noParam: true,
            success:function(data){
            	$scope.listData = data.data.rows;
				$scope.totalPage = data.data.total;           
            }
        });		*/
	    $scope.indexName = itemData.name;       
		  
		/*  
		  //索引还原 	  
		  $scope.restore = function(item){
			  var dataparam = {
  					params: item.id
  		     };
				httpLoad.loadData({
		            url:'/indexmng/logIndex/restore',
		            method:'POST',
		            data: dataparam,    //传递数据 
		            noParam: true,
		            success:function(data){
		            	showMessage($scope,data);   		            	 
		            }
		        });		
         };*/
         
 
         
          /**
           * 关闭操作列表 
           */
          $scope.cancel = function(){
              $modalInstance.dismiss('cancel'); // 退出
          };
      }]);	
	
	/**
	 * 打开消息方法
	 */
	var showMessage = function(popObj,data){
		if (!data) {
			popObj.pop('操作完成');
			return;
		}
		if (data.success) {
      		if (data.message) {
      			popObj.pop(data.message);    
      		}
      		else {
      			popObj.pop('操作完成');
      		}
      	}
      	else {
      		if (data.message) {
      			popObj.pop(data.message,'error');    
      		}
      		else {      	            		 
      			popObj.pop(data.message,'操作失败。');    
       		}
      	}      	            	 
	};
	
	
	
})();


//重置搜索条件
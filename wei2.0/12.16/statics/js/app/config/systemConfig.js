/**
 * Created by huyuanning on 2016/11/28.
 */
(function(){ 
	var _checkedIds = [];
	var _parentScope;
	app.controller('LogCommonCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$state','$timeout','LANGUAGE',
	 function($scope, httpLoad, $rootScope, $modal,$state, $timeout,LANGUAGE) { 
		$rootScope.moduleTitle = '参数管理 > 系统配置';
		_parentScope = $scope;
		$scope.param = { 
			page: 1, 
			rows: 10,
			params : angular.toJson([{param: {isDeleted:'0'}, sign: 'EQ'}])
		};
		$scope.getList = function(page){
			_checkedIds = [];
			$scope.param.page = page || $scope.param.page;
			httpLoad.loadData({
				url: '/systemConfig/list',
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
				isDeleted:'0',
				status:$scope.status
			});
			if (angular.toJson(param1).length > 0) params.push({param: param1, sign: 'EQ'});
			if ($scope.gmtTime) {
				params.push({param: {gmtCreate: toFormatTime($scope.gmtTime, 0)}, sign: 'GET'});
				params.push({param: {gmtCreate: toFormatTime($scope.gmtTime, 1)}, sign: 'LET'});
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
		
         //编辑
         $scope.update = function(item){  //打开模态
             var modalInstance = $modal.open({
                 templateUrl : '/statics/tpl/config/systemConfig/update.html',  //指向上面创建的视图
                 controller : 'updateCommConfigModalCtrl',// 初始化模态范围
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
         
		$scope.reset = function(){
			var obj = ['gmtCreate','name','status'];
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
	 
	
	//--索引操作记录展示、包含主表和明细表                         IndexOperationCtrl
	angular.module('app').controller('updateCommConfigModalCtrl',['$scope','$modalInstance','itemData','LANGUAGE','httpLoad',
      function($scope,$modalInstance,itemData,LANGUAGE,httpLoad){ //依赖于modalInstance	
		var dataparam = {
					params: angular.toJson({"id":itemData.id})
		};
		
		httpLoad.loadData({
            url:'/systemConfig/detail',
            method:'POST',
            data: dataparam,
            noParam: true,
            success:function(data){
            	if(data.success){
            		var data = data.data;
					$scope.updateData = data;
				}      
            }
        });	 
		
		/**
         * 关闭操作列表 
         */
        $scope.cancel = function(){
            $modalInstance.dismiss('cancel'); // 退出
        };
		
	    /**
         * 修改配置
         */
        $scope.modify = function(){        	 
    		var modifyData = {    				
    				params: angular.toJson({id :itemData.id,name:$scope.updateData.name,
    				content:$scope.updateData.content,remark:$scope.updateData.remark})
    		};
    		 
        	httpLoad.loadData({
                url:'/systemConfig/modify',
                method:'POST',
                data: modifyData,
                noParam: true,
                success:function(data){
                	if(data.success){
                		$scope.cancel();
    				}      
                }
            });	    
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
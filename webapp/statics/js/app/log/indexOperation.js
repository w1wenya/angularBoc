angular.module('app').controller('indexOperationCtrl', ['$rootScope', '$scope','$state','httpLoad','$modal','$stateParams','LANGUAGE',function($rootScope, $scope,$state,httpLoad,$modal,$stateParams,LANGUAGE) {
    $rootScope.link = '/statics/css/user.css';//引入页面样式
    $rootScope.moduleTitle = '日志管理 > 索引管理';
    $scope.param = {
        rows: 10
    };
    var _parentObject = $scope;
    (function(){
        var id = $stateParams.id;
        //获取租户下的用户列表
        $scope.getList = function(page){
            $scope.param.page = page || $scope.param.page;           
            $scope.param = {
            		page: $scope.param.page,
                    rows: $scope.param.rows,
    				params:angular.toJson([{"param":{"indexId":id},"sign":"EQ"}])
    			};
 
    		httpLoad.loadData({
                url:'/indexmng/logIndexOp/list',
                method:'POST',
                data: $scope.param,    //传递数据 
                noParam: true,
                success:function(data){
                	if(data.success&&data.data){  
                        $scope.listData = data.data.rows;
        				$scope.totalPage = data.data.total;    
        				$scope.indexName = data.solution;
                    }else{
                        $scope.isImageData = true;
                    }  
                }
            });		             
        };
        $scope.getList(1);
    })();
    
    
    $scope.goBack = function(){
        $state.go('app.log.indexmng');
    };
    
    /**
	  * 索引还原确认
	  */
	 $scope.restortConfirm = function(item){  //打开模态		 
		var operationType = item.type;
		if(operationType && (operationType =='BACKUP' || operationType =='ARCHIVE')) {		 
	        var modalInstance = $modal.open({
	            templateUrl : '/statics/tpl/log/indexrestore.html',
	            controller : 'restoreModalCtrl',
	            resolve : {
	                id: function() {
	                    return  item.id;
	                }
	            }
	        });
	        modalInstance.result.then(function(){
	        },function(){});
		}
       
    } 
	 
	  /**
	  * 备份删除确认窗口弹出
	  */
	 $scope.deleteConfirm = function(item){  //打开模态		 
		var operationType = item.type;
		if(operationType && (operationType =='BACKUP' || operationType =='ARCHIVE')) {	
	        var modalInstance = $modal.open({
	            templateUrl : '/statics/tpl/log/indexOperDelete.html',
	            controller : 'backdDeleteCtrl',
	            resolve : {
	                id: function() {
	                    return  item.id;
	                }
	            }
	        });
		 
            modalInstance.result.then(function(){},function(){});
		}
    } 
	 
	 /**
	  *索引还原
	  */
	angular.module('app').controller('restoreModalCtrl',['$scope','$modalInstance','id','LANGUAGE','httpLoad',
        function($scope,$modalInstance,id,LANGUAGE,httpLoad){ //依赖于modalInstance
            $scope.ok = function(){
            	$modalInstance.dismiss('cancel');             	
            	 var dataparam = {
     					params: id
     		     };
     			httpLoad.loadData({
     	            url:'/indexmng/logIndex/restore',
     	            method:'POST',
     	            data: dataparam,    //传递数据 
     	            noParam: true,
     	            success:function(data){
     	            	showMessage($scope,data);  
     	            	_parentObject.getList();		            	 
     	            }
     	        });		
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // 退出
            }
    }]); 
	
	 /**
	  *索引删除
	  */
	angular.module('app').controller('backdDeleteCtrl',['$scope','$modalInstance','id','LANGUAGE','httpLoad',
       function($scope,$modalInstance,id,LANGUAGE,httpLoad){ //依赖于modalInstance
           $scope.ok = function(){
           	$modalInstance.dismiss('cancel');             	
           	 var dataparam = {
    					params: id
    		     };
    			httpLoad.loadData({
    	            url:'/indexmng/logIndexOp/remove',
    	            method:'POST',
    	            data: dataparam,    //传递数据 
    	            noParam: true,
    	            success:function(data){
    	            	showMessage($scope,data);  
    	            	_parentObject.getList();		            	 
    	            }
    	        });		
           };
           $scope.cancel = function(){
               $modalInstance.dismiss('cancel'); // 退出
           }
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
	
	 
	
}]);


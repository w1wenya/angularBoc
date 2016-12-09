/**
 * Created by Zhang Haijun on 2016/8/31.
 */
(function () {
	'use strict';
	app.constant('TASKMESSAGE', {});
	angular.module('webSocket.services', [])
		.service('webSocket', [ function () {
			var socket;
			return {
				init: function(){
					if ('WebSocket' in window) {
						var url = 'ws://' + location.host + '/messageService';
						socket = new WebSocket(url);
					}else{
						console.log('Websocket not supported');
					}
				},
				loadData: function(options) {
					socket.onopen = function (data) {
							// var open = options.open;
							// if (open && typeof open == 'function') {
							// 	open(JSON.stringify(options.data));
							// }
						};
					socket.onclose = function (data) {
							// var close = options.close;
							// if (close && typeof close == 'function') {
							// 	close(data);
							// }
						};
					socket.onmessage = function (event) {
							var message = options.message;
							if (message && typeof message == 'function') {
								var data = JSON.parse(JSON.parse(event.data).content);
								message(data);
								console.log(data);
								if(data.taskId) {
									if(data.progress == 100){
										sessionStorage.removeItem('T'+data.taskId);
										return;
									}
									sessionStorage.setItem('T'+data.taskId,data.progress);
								}else{
									if(data.progress == 100){
										sessionStorage.removeItem('J'+data.jobId);
										return;
									}
									sessionStorage.setItem('J'+data.jobId,data.progress);
								}
							}
						};
				}
			};
		}]);
})();
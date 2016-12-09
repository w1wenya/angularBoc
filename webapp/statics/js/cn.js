/**
 * Created by Zhang Haijun on 2016/6/17.
 */
(function(){
	"use strict";
	app.service('CommonData', function() {
		var service = {
			//定义应用类型
			appType:{
				CCS: "工业控制系统",
				OA: "办公自动化系统"
			},
			startWaysData:{
				WEB: '页面执行',
				API: 'API调用',
				CRON: '定时执行'
			},
			alarmStatus:{
				UNCONFIRMED:'未确认',
				CONFIRMED:'已确认',
				SOLVED:'已解决'
			},
			alarmLevel:[
				{name:"提醒告警",value:"REMIND"},
				{name:"警告告警",value:"WARN"},
				{name:"严重告警",value:"DANGER"}
			],
			alarmNoticeLevel:[
				{name:"所有告警",value:"ALL"},
				{name:"提醒告警",value:"REMIND"},
				{name:"警告告警",value:"WARN"},
				{name:"严重告警",value:"DANGER"}
			],
			noticeWay:{
				EMAIL:'邮件',
				SMS:'短信'
			},
			noticeTime:{
				WORKTIME:'工作时间',
				NONWORKTIME:'非工作时间',
				ANYTIME:'任何时间'
			},
			noticeDelay:[
				{name:"立刻",value:"0"},
				{name:"1分钟后",value:"4"},
				{name:"2分钟后",value:"2"},
				{name:"5分钟后",value:"5"},
				{name:"10分钟后",value:"10"},
				{name:"15分钟后",value:"15"},
				{name:"30分钟后",value:"30"},
				{name:"1小时后",value:"60"},
				{name:"4小时后",value:"240"},
				{name:"1天后",value:"1440"}
			],
			messageStatus:{
				READ:'已读',
				UNREAD:'未读'
			},
			applyStatus:{
				APPLYING:'申请中',
				APPROVED:'已批准',
				REFUSED:'已拒绝'
			},
			signData:[
				{name:"<"},
				{name:"<="},
				{name:"="},
				{name:">"},
				{name:">="}
			],
			fnData:[
				{name:"min"},
				{name:"avg"},
				{name:"max"}
			],
			pluginType:{
				input:'输入插件(input)',
				filter:'过滤器插件(filter)'
			},
			inputPluginTypeProperty:{
				stdin:'标准输入(Stdin)',
				file:'读取文件(File)',
				tcp:'读取网络数据(TCP)',
				generator:'生成测试数据(Generator)',
				syslog:'读取 Syslog数据',
				redis:'读取 Redis 数据',
				collectd:'读取Collectd数据'
			},
			filterPluginTypeProperty:{
				grok :'Grok正则捕获',
				mutate :'数据修改(Mutate)',
				geoip:'GeoIP查询归类',
				json :'JSON编解码',
				split:'split拆分事件',
				useragent:'UserAgent匹配归类',
				ruby:'Ruby处理'
			}
		};
		return service;
	});
	app.constant('LANGUAGE', {
		ASSETS: {
			CENTER:{
				REMARK: '数据中心是容器平台内所有提供计算服务的物理服务器或者虚拟机的统称；主要作为容器的宿主机、集群管理节点和私有仓库来使用。',
				ADD_SUCCESS: '数据中心添加成功',
				EDIT_SUCCESS: '数据中心编辑成功',
				DEL_SUCCESS: '数据中心删除成功'
			},
			ROOM: {
				REMARK: '机房是容器平台内所有提供计算服务的物理服务器或者虚拟机的统称；主要作为容器的宿主机、集群管理节点和私有仓库来使用。',
				ADD_SUCCESS: '机房添加成功',
				EDIT_SUCCESS: '机房编辑成功',
				DEL_SUCCESS: '机房删除成功'
			},
			ZONE: {
				ADD_SUCCESS: '分区添加成功',
				EDIT_SUCCESS: '分区编辑成功',
				DEL_SUCCESS: '分区删除成功'
			},
			RACK: {
				REMARK: '机柜是容器平台内所有提供计算服务的物理服务器或者虚拟机的统称；主要作为容器的宿主机、集群管理节点和私有仓库来使用。',
				ADD_SUCCESS: '机柜添加成功',
				EDIT_SUCCESS: '机柜编辑成功',
				DEL_SUCCESS: '机柜删除成功'
			},
			SERVER: {
				REMARK: '机柜是容器平台内所有提供计算服务的物理服务器或者虚拟机的统称；主要作为容器的宿主机、集群管理节点和私有仓库来使用。',
				ADD_SUCCESS: '服务器添加成功',
				EDIT_SUCCESS: '服务器编辑成功',
				DEL_SUCCESS: '服务器删除成功'
			},
			HOST: {
				REMARK: '主机是容器平台内所有提供计算服务的物理服务器或者虚拟机的统称；主要作为容器的宿主机、集群管理节点和私有仓库来使用。',
				ADD_SUCCESS: '主机添加成功',
				EDIT_SUCCESS: '主机编辑成功',
				DEL_SUCCESS: '主机删除成功'
			},
			GROUP: {
				REMARK:'集群提供了对应用主机的统一管理和资源调度，是容器的载体，为所有的容器提供统一的操作入口。集群管理提供了创建集群，删除集群，修改集群，管理节点和计算节点的删、启、停等功能。',
				ADD_SUCCESS: '集群添加成功',
				EDIT_SUCCESS: '集群编辑成功',
				DEL_SUCCESS: '集群删除成功',
				ADD_NODE_SUCCESS: '节点添加成功',
				DEL_NODE_SUCCESS: '节点删除成功',
				START_NODE_SUCCESS: '节点启动成功',
				STOP_NODE_SUCCESS: '节点停止成功'
			},
			CONTAINER:{
				REMARK:'容器是容器平台中对外提供服务的节点，依托于Docker引擎来对外提供服务。',
				START_SUCCESS:'容器启动成功',
				RESTART_SUCCESS:'容器重启成功',
				STOP_SUCCESS:'容器停止成功',
				DEL_SUCCESS:'容器删除成功'
			},
			POOL: {
				ADD_SUCCESS: '资源池添加成功',
				EDIT_SUCCESS: '资源池编辑成功',
				DEL_SUCCESS: '资源池删除成功',
				ADD_RES_SUCCESS: '资源添加成功',
				DEL_RES_SUCCESS: '资源删除成功'
			}
		},
		OPERATION: {
			TENANT: {
				ADD_SUCCESS: '租户添加成功',
				EDIT_SUCCESS: '租户编辑成功',
				DEL_SUCCESS: '租户删除成功',
				FREEZE_SUCCESS: '租户冻结成功',
				THAW_SUCCESS: '租户解冻成功',
				GRANT_SUCCESS: '租户授权成功',
				SIZE_SUCCESS: '租户配额成功'
			},
			USER: {
				ADD_SUCCESS: '用户添加成功',
				EDIT_SUCCESS: '用户编辑成功',
				DEL_SUCCESS: '用户删除成功',
				FREEZE_SUCCESS: '用户冻结成功',
				THAW_SUCCESS: '用户解冻成功',
				GRANT_SUCCESS: '用户授权成功',
				RESET: '密码已重置为123456',
				REMARK: '用户是容器平台中所有角色下用户的简称，用户管理提供用户的添加、授权、编辑、冻结、激活等功能。',
				DETAILREMARK: '用户是容器平台中所有角色下用户的简称，用户管理提供用户的添加、授权、编辑、冻结、激活等功能。',
				SIZE_SUCCESS: '租户配额成功'
			},
			ROLE: {
				ADD_SUCCESS: '角色添加成功',
				EDIT_SUCCESS: '角色编辑成功',
				DEL_SUCCESS: '角色删除成功',
				GRANT_SUCCESS: '角色授权成功',
				REMARK: '角色是容器平台中所有角色的简称，角色管理提供角色的赋权、角色的修改等功能。'
			},
			PERMISSION: {
				ADD_SUCCESS: '权限添加成功',
				EDIT_SUCCESS: '权限编辑成功',
				DEL_SUCCESS: '权限删除成功',
				REMARK: '权限是容器平台中所有权限的简称，权限管理提供修改权限的功能。'
			}
		},
		APPLICATION:{
			MANAGE:{
				ADD_SUCCESS: '应用添加成功',
				EDIT_SUCCESS: '应用编辑成功',
				DEL_SUCCESS: '应用删除成功',
				DEPLOY_SUCCESS: '应用集成部署成功',
				DEL_BIND_SUCCESS: '资源分配删除成功',
				ADD_BIND_SUCCESS: '资源分配添加成功',
				EDIT_BIND_SUCCESS: '资源分配编辑成功',
			}
		},
		ALARM:{
			MANAGE:{
				CONFIRM_SUCCESS: '警告已经确认',
				SLOVE_SUCCESS: '警告已解决',
				DEL_SUCCESS: '警告已删除'
			},
			ALARM:{
				ADD_SUCCESS: '告警策略添加成功',
				EDIT_SUCCESS: '告警策略编辑成功',
				DEL_SUCCESS: '告警策略删除成功',
			},
			ASSIGN:{
				ADD_SUCCESS: '分派策略添加成功',
				EDIT_SUCCESS: '分派策略编辑成功',
				DEL_SUCCESS: '分派策略删除成功',
			},
			NOTICE:{
				ADD_SUCCESS: '通知策略添加成功',
				EDIT_SUCCESS: '通知策略编辑成功',
				DEL_SUCCESS: '通知策略删除成功',
				BIND_SUCCESS: '人员绑定成功',
			}
		},
		LOG:{
			PLUGIN:{
				ADD_SUCCESS: '插件添加成功',
				EDIT_SUCCESS: '插件编辑成功',
				DEL_SUCCESS: '插件删除成功',
			},
			SOURCE:{
				ADD_SUCCESS: '插件添加成功',
				EDIT_SUCCESS: '插件编辑成功',
				DEL_SUCCESS: '插件删除成功',
			}
		},
		PERSONAL:{
			MESSAGE:{
				DEL_SUCCESS: '消息删除成功'
			}
		},
		PROCESS:{
			APPLY:{
				ADD_SUCCESS: '申请添加成功',
				DEL_SUCCESS: '申请删除成功',
				APPROVE_SUCCESS: '申请通过',
				REFUSE_SUCCESS: '申请拒绝'
			}
		},
		MONITOR:{
			MANAGE:{
				ADD_SUCCESS: '监控项添加成功',
				DEL_SUCCESS: '监控项删除成功',
				EDIT_SUCCESS: '监控项编辑成功',
				REFUSE_SUCCESS: '申请拒绝'
			},
			ITEM:{
				ADD_SUCCESS: '监控子项添加成功',
				DEL_SUCCESS: '监控子项删除成功',
				EDIT_SUCCESS: '监控子项编辑成功'
			},
			MONITOR_RECORD:{
				DEL_SUCCESS: '记录删除成功',
			},
			MONITOR_PLUGIN:{
				ADD_SUCCESS: '配置添加成功',
				DEL_SUCCESS: '删除成功',
				EDIT_SUCCESS: '配置编辑成功'
			},
			MONITOR_UPLOAD:{
				UPLOAD_SUCCESS: '配置下发成功'
			}
		}
	});
	//未做权限控制页面
	app.constant('IGNOREPERMISSION', {
		IGNORELIST:'#accesslogin#appassetscenterdetail#appassetsroomdetail#appassetsrackdetail#appassetsserverdetail#appassetsvmDetail#appassetsvolumeDetail#appassetssnapshotDetail#appassetsflavorDetail#appassetsnetworkDetail#appassetstenantQuotaDetail#appassetsvmAdd#appassetsvmUpdate#appassetsimageDetail#appassetsbucketDetail' +
					'#appoperationnewtask#appoperationnewtpl#appoperationtimedOperationDetail'+
			         '#appconfiggroupManageScriptDetail#appconfigmanageSoftwareDetail#appconfiggroupManageSoftwareDetail#appoperationaccountDetail#appconfigcloudVendorAccount#appconfigcloudVendorDetail#appconfigcloudVendorAdd#appconfigcloudVendorUpdate#appconfigcloudAccountDetail#appconfigcommandDetail'+
			         '#appuserCentertenantDetail#appuserCentertenantResource#appuserCentertenantUser#appuserCentertenantRole#appuserCenteruserDetail#appuserCenteruserResource#appuserCenterpermissionDetail#appuserCenterdepartmentDetail#appuserCenterdepartmentResource#appuserCenteruserGroupDetail#appuserCenterresGroupDetail' +
					'#appdashborad#appapplicationappdetail#appapplicationhistory#appapplicationintegrateDetail#appapplicationintegrateJob'+
		           '#appmonitordatacenterMonitor#appmonitorroomMonitor#appmonitorrackMonitor#appmonitorserverMonitor#appmonitorvmMonitor#appmonitormeasureNameDetail' +
		            '#appalarmmanagedetail#appalarmmanagedetail#appalarmalarmdetail#appalarmnoticedetail#appapplicationbindhost#applogplugincreate#applogplugindetail#applogsourcecreate#applogsourcedetail'+
					     "#appautosmachineinstall#machinedetail#appmonitormeasureitem#appmonitormeasurerecord#appmonitormeasurerecorddetail#appmonitormeasureplugin#appmonitormeasureupload#appalarmalarmupload#applogindexOperation#applogindexDetail"});
	//中英文转换过滤器
	app.filter('cn',function(){
		return function (value, opt) {
			var cnData = {
				taskStatus:{
					UNEXCUTE: '未执行',
					RUNNING: '正在执行',
					SUCCESS: '执行成功',
					PAUSED:'暂停中',
					FAIL: '执行失败',
					SKIPPED: '跳过',
					IGNORE: '忽略错误',
					WAITING: '等待用户',
					CANCEL: '手动结束',
					ABNORMAL: '状态异常'
				},
				timeTaskStatus:{
					UNEXECUTE: '未执行',
					RUNNING: '已激活',
					WAITING: '等待中',
					PAUSED: '已挂起'
				},
				startWay:{
					WEB: '页面执行',
					API: 'API调用',
					CRON: '定时执行'
				},
				status: {
					NORMAL: '正常',
					ALARM: '告警',
					ABNORMAL: '异常',
					DISABLED:'不可用'
				},
				isSudo: {
					true: '是',
					false: '否'
				},
				containerStatus: {
					RUNNING: '运行中',
					STOP: '停止',
					CREATED:'新建'
				},
				taskType:{
					SCRIPT:'执行脚本',
					FILE:'文件分发',
					BACKUP:'文件备份',
					RECOVERY:'文件恢复'
				},
				level:{
					DEADLY: '致命',
					HIGH: '严重',
					SERIOUS: '高危',
					MEDIUM: '中等',
					COMMON: '普通'
				},
				appType:{
					CCS: "工业控制系统",
					OA: "办公自动化系统"
				},
				alarmStatus:{
					UNCONFIRMED:'未确认',
					CONFIRMED:'已确认',
					SOLVED:'已解决'
				},
				alarmLevel:{
					ALL:'所有告警',
					REMIND:'提醒告警',
					WARN:'警告告警',
					DANGER:'严重告警'
				},
				noticeWay:{
					EMAIL:'邮件',
					SMS:'短信'
				},
				noticeTime:{
					WORKTIME:'工作时间',
					NONWORKTIME:'非工作时间',
					ANYTIME:'任何时间'
				},
				noticeDelay:{
					0:'立刻',
					1:'1分钟后',
					2:'2分钟后',
					5:'5分钟后',
					10:'10分钟后',
					15:'15分钟后',
					30:'30分钟后',
					60:'1小时后',
					240:'4小时后',
					1440:'1天后'
				},
				messageStatus:{
					READ:'已读',
					UNREAD:'未读'
				},
				applyStatus:{
					APPLYING:'申请中',
					APPROVED:'已批准',
					REFUSED:'已拒绝'
				},
				category:{
					Computer:'计算资源',
					Storage:'存储资源',
					Network:'网络资源'
				},
				category2:{
					CPS:'云平台',
					OSS:'云存储'
				},
				catalog:{
					PHYSICAL:'物理机',
					LOGICAL:'虚拟机'
				},
				acl:{
					true:'公有',
					false:'私有'
				},
				vmStatus:{
					RUNNING: '运行中',
					STOPPED: '关机',
					STOPPING: '关机中',
					STARTING: '开机中',
					SUSPENDED: '挂起',
					SUSPENDING: '挂起中',
					ACTIVING: '激活中',
					PAUSED: '停止',
					PAUSING: '停止中',
					RECOVERING: '恢复中',
					BUILDING: '创建中',
					RESTARTING: '重启中',
					EXCEPTION: '异常'
				}
			};
			return cnData[opt][value];
		}
	});
	//租户，用户，云供应商的冻结解冻状态
	app.filter('cnUser',function(){
		return function (value, opt) {
			var cnUserData = {
				status:{
					NORMAL: '正常',
					ABNORMAL: '已冻结'
				}
			};
			return cnUserData[opt][value];
		}
	});
	//定时作业状态
	app.filter('cnTimed',function(){
		return function (value, opt) {
			var cnTimedData = {
				status:{
					UNEXECUTE: '未执行',
					RUNNING: '已激活',
					WAITING: '等待中',
					PAUSED: '已挂起'
				}
			};
			return cnTimedData[opt][value];
		}
	});
	//日志索引归档状态
	app.filter('cnBackStatus',function(){
		return function (value, opt) {
			var cnStatusData = {
				status:{
					NOBACK: '未备份',
					BACKED: '已备份'
				}
			};
			return cnStatusData[opt][value];
		}
	});
	//日志索引备份状态
	app.filter('cnArchiveStatus',function(){
		return function (value, opt) {
			var cnStatusData = {
				status:{
					NOARCHIVE: '未归档',
					ARCHIVED: '已归档'
				}
			};
			return cnStatusData[opt][value];
		}
	});
	//索引操作类型
	app.filter('cnIndexOpType',function(){
		return function (value, opt) {
			var cnStatusData = {
				status:{
					BACKUP: '备份',
					ARCHIVE: '归档',
					RESTORE: '还原'
				}
			};
			return cnStatusData[opt][value];
		}
	});
	
	//索引还原与禁用
	app.filter('cnIndexOperation',function(){
		return function (value, opt) {
			var cnStatusData = {
				status:{
					BACKUP: '还原',
					ARCHIVE: '还原',
					RESTORE: '禁用'
				}
			};
			return cnStatusData[opt][value];
		}
	});
	//备份删除与禁用
	app.filter('cnBackupDelete',function(){
		return function (value, opt) {
			var cnStatusData = {
				status:{
					BACKUP: '删除',
					ARCHIVE: '删除',
					RESTORE: '禁用'
				}
			};
			return cnStatusData[opt][value];
		}
	});
	//索引操作
	app.filter('cnLogIndexStatus',function(){
		return function (value, opt) {
			var cnStatusData = {
				status:{
					VALID: '有效',
					DELETE: '已删除'
				}
			};
			return cnStatusData[opt][value];
		}
	});
})();
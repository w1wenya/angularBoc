/**
 * Created by Zhang Haijun on 2016/8/9.
 */
//数据接口
materialAdmin.constant('CONFIG', {
	'/login': '/data/access/login.json',
	//退出
	"/logout" : "/data/assets/datacenter/dataCenter-modify.json",
	// 用户修改密码
	"/user/change" : "/data/assets/datacenter/dataCenter-modify.json",   //密码修改
	"/user/check" : "/data/assets/datacenter/dataCenter-modify.json",    //密码校验
	// 基础信息
	"/host/list" : "/data/basis/host.json",
	"/host/create" : "/data/basis/host.json",
    "/host/modify" : "/data/basis/dataCenter-modify.json",
    "/host/basic" : "/data/basis/dataCenter-basic.json",
    "/host/remove" : "/data/basis/dataCenter-modify.json",
    "/host/detail" : "/data/basis/dataCenter-modify.json",
    '/task/graph/list': '/data/basis/taskList.json',
    '/task/graph/remove': '/data/basis/dataCenter-modify.json',
    //认证管理
    '/ident/list': '/data/config/identList.json',
    '/ident/create':"/data/basis/dataCenter-modify.json",
    '/ident/modify': "/data/basis/dataCenter-modify.json",
    '/ident/remove': "/data/basis/dataCenter-modify.json",
    '/ident/detail' : '/data/config/ident-detail.json',
    //系统字典
    '/dict/list' : '/data/config/dictionaryList.json',
    '/dict/children' : '/data/config/dictionaryList.json',
    //脚本管理
    '/script/list': '/data/operation/scriptList.json',
    '/script/create': '/data/operation/account.json',
    '/script/modify': '/data/operation/account.json',
    '/script/remove': '/data/operation/account.json',
    '/script/detail': '/data/operation/scriptvalues.json',
    '/script/group/listAll':'/data/config/scriptGroupList.json',
    //脚本分组管理
    '/script/group/list': '/data/config/scriptGroupList.json',
    '/script/group/create': '/data/basis/dataCenter-modify.json',
    '/script/group/modify': '/data/basis/dataCenter-modify.json',
    '/script/group/remove': '/data/basis/dataCenter-modify.json',
    '/script/group/detail' : '/data/config/scriptGroup-detail.json',


});
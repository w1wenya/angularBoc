(function() {
  angular.module('validation.rule', ['validation']).config(['$validationProvider',function($validationProvider) {
        $validationProvider.showSuccessMessage = false;

        $validationProvider.setErrorHTML(function(msg) {
          return "<label class=\"validation-invalid text-danger\">" + msg + "</label>";
        });
        
        var expression = {
          required: function(value) {
            return !!value;
          },
          number: /^\d+$/,       //整数
          //number2: /^\d{1,4}$/,         //输入四位数
          positiveNumber: /^[1-9][0-9]*$/,        //正整数
          positionNumber: /^[A-Za-z0-9\u4e00-\u9fa5]+\-[A-Za-z0-9\u4e00-\u9fa5]+\-[A-Za-z0-9\u4e00-\u9fa5]{1,}$/,          //楼号-楼层-房间号,中间以中划线隔开,数字、字母、汉字
          specNumber: /^[0-9]+\/[0-9]+\/[0-9]{1,}$/,
          snNumber: /^[0-9a-zA-Z- ]+$/,          //支持空格、数字、字母、中划线
          warrantyNumber: /^[0-9\u4e00-\u9fa5]+$/,       //支持数字、中文
          url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
          email: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.(com|cn|org|net)){1,2})$/,
          englishname: /^[a-zA-Z ]+$/,
          chinaname: /^[\u4e00-\u9fa5]*$/,
          floatnum: /\d+\.?\d*$/,
          account: /^[a-zA-Z0-9_]*$/,
          password: /^[\x21-\x7ea-zA-Z0-9_]{6,18}$/,
          password2: /^[\x21-\x7ea-zA-Z0-9_]{8,30}$/,
          passwords: /^[\x21-\x7ea-zA-Z0-9_]{1,18}$/,
          cellphone: /^(13[0123456789]|14[57]|15[012356789]|18[0123456789]|17[067])[0-9]{8}$/,   //手机
          telphone: /^0\d{2,3}-?\d{7,8}$/,    //座机
          phone:/(^1[3|4|5|7|8]\d{9}$)|(^0\d{2,3}-?\d{7,8}$)/ ,     //手机、座机
          date: /^(\d{4})-(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])$/,     //yyyy-mm-dd
          idcard: /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
          hostname: /^[\u4e00-\u9fa5\w-]{1,30}$/,
          name: /^[\u4e00-\u9fa5\w-]*$/,
          //name: /^[\u4e00-\u9fa5]{1,32}$|^[\dA-Za-z_]{1,64}$/,
          ip: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
          port:  /^([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
          path: /^\/.*/,
          packagepath: /^\/.*\.(zip|tar|tar.gz)$/,
          minone:function(str) {
            var reg = /\d+\.?\d*$/;
            return reg.test(str) && parseInt(str) > 0
          },
          minlength: function(value, scope, element, attrs, param) {
            return value.length >= param;
          },
          maxlength: function(value, scope, element, attrs, param) {
            var result;
            var valueStr = value.toString();
            var length = valueStr.length;
            for(var i=0;i<length;i++){
               if(valueStr.charCodeAt(i)>255){
                result = valueStr.replace(/[\u4e00-\u9fa5]/g,"aa");
               }
            }
            if(typeof result!='undefined'){
              return result.length <= parseInt(attrs.maxlength);
            }
          },
          maxvalue: function(value, scope, element, attrs, param) {
            var result;
            var valueStr = parseInt(value);
            if(typeof result!='undefined'){
              return valueStr <= parseInt(attrs.maxvalue);
            }
          },
          account_opt: function(value) {
            var reg = /^[a-zA-Z0-9_]*$/;
            return reg.test(value);
          },
          password_opt: function(value) {
            var reg = /^([\x21-\x7ea-zA-Z0-9_]{1,18})?$/;
            return reg.test(value || '');
          },
          port_opt: function(value) {
            var reg = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])?$/;
            return reg.test(value || '');
          },
          ip_opt: function(value) {
            var reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]))?$/;
            return reg.test(value || '');
          },
          address_opt: function(value) {
            var b1 = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
            var b2 = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
            return (b1.test(value))||(b2.test(value));
          }
        };

        var defaultMsg = {
          required: {
            error: '请输入内容'
          },
          warrantyNumber: {
              error: '请输入中文、数字'
          },
          url: {
            error: '请输入正确格式的网址',
            success: 'It\'s Url'
          },
          email: {
            error: '请输入正确格式的邮箱'
          },
          minone: {
            error: 'This should be a larger than one Number',
            success: 'It\'s Number'
          },
          number: {
            error: '请输入整数',
            success: 'It\'s Number'
          },
          positiveNumber: {
              error: '请输入正整数'
          },
          positionNumber:{
            error: '请输入楼号-楼层-房间号，中间以中划线隔开，可以是数字、中文、字母'
          },
          specNumber:{
            error: '请输入长/宽/高，中间以斜杠隔开，可以是数字'
          },
          snNumber:{
            error: '请输入空格、数字、字母、中划线'
          },
          floatnum:{
            error: 'This should be Number',
            success: 'It\'s Number'
          },
          minlength: {
            error: 'This should be longer',
            success: 'Long enough!'
          },
          maxlength: {
            error: 'This should be shorter'
          },
          maxvalue: {
            error: 'This should be shorter'
          },
          englishname: {
            error: 'Please enter valid name entry using letters only.'
          },
          account: {
            error: '请输入数字、字母、下划线'
          },
          account_opt: {
            error: '输入信息格式有误'
          },
          password: {
            error: '密码长度至少6位，最多不超过18位'
          },
          password2: {
            error: '密码长度至少8位，最多不超过30位'
          },
          passwords: {
            error: '密码长度最多不超过18位'
          },
          password_opt: {
            error: '密码长度最多不超过18位'
          },
          cellphone: {
            error: '手机号码格式有误'
          },
          telphone: {
            error: '座机号码格式有误'
          },
          phone: {
              error: '请输入手机号码或座机'
            },
          chinaname: {
            error: '请输入汉字'
          },
          date: {
            error: '请输入正确的日期格式'
          },
          idcard: {
            error: '请输入正确的身份证号'
          },
          hostname: {
            error: '请输入少于30个字符的正确格式的名称'
          },
          name: {
          error: '请输入中文、字母、数字、下划线或中划线'
          },
          ip: {
            error: '请输入正确的IP地址'
          },
          ip_opt: {
            error: '请输入正确的IP地址'
          },
          port: {
            error: '请输入正确的端口号'
          },
          path: {
          error: '请输入正确的路径'
          },
          packagepath: {
            error: '请输入正确的路径'
          },
          port_opt: {
            error: '请输入正确的端口号'
          },
          address_opt:{
            error: '请输入正确的IP地址或网址'
          }
        };

        $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);

      }
    
      
    ]);

}).call(this);
const Core = require('@alicloud/pop-core');

class SmsUtils{

  static sendSMS(smsMessage, type){

    let client = new Core({
      accessKeyId: 'LTAIb80YAEMpH33Z',
      accessKeySecret: 'LgMcEi6tD5IULxebVPlNZxZBSRCsCL',
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25'
    });

    let params = {
      "RegionId": "cn-hangzhou",
      "SignName": "图钉墙",
      "phoneNumbers":smsMessage.mobile,
    }

    var requestOption = {
      method: 'POST'
    };

    if(type == 0){
      params.TemplateCode = 'SMS_70920299'; //信息变更验证码
    }
    else if (type == 1){
      params.TemplateCode = 'SMS_70920300'; //修改密码验证码
    }
    else if (type == 2){
      params.TemplateCode = 'SMS_70920301'; //活动确认验证码
    }
    else if (type == 3){
      params.TemplateCode = 'SMS_70920302'; //用户注册验证码
    }
    else if (type == 4){
      params.TemplateCode = 'SMS_70920303'; //登录异常验证码
    }
    else if (type == 5){
      params.TemplateCode = 'SMS_70920304'; //登录确认验证码
    }
    else if (type == 6){
      params.TemplateCode = 'SMS_70920306'; //身份验证验证码
    }
    params.TemplateParam = `{"code":"${smsMessage.code}","product":"图钉墙"}`;

    let data = client.request('SendSms', params, requestOption).then((result) => {
      return result;
    }, (ex) => {
      return ex.data;
    })
    return data;
  }

}

module.exports = SmsUtils;

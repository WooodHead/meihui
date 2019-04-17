'use strict'

const BaseController = require('../BaseController');
const Captcha = require('svg-captcha');
const request = require('request');

class UsersController extends BaseController{

  async index() {
    const ctx = this.ctx;
    const query = {
      limit: ctx.helper.parseInt(ctx.query.limit),
      offset: ctx.helper.parseInt(ctx.query.offset),
    };

    try{
      const result = await ctx.service.users.list(query);
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async show() {
    const ctx = this.ctx;
    try{
      const result = await ctx.service.users.find(ctx.helper.parseInt(ctx.params.id));
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async createUser() {
    const ctx = this.ctx;
    try{
      let data = ctx.request.body;
      if (data.captchaText != this.ctx.session.captcha){
        super.failure(ctx.__('verificationCodeError'));
      }
      else{
        const user = await ctx.service.users.createUser(data);
        super.success(ctx.__('createdSuccess'));
      }

    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async update() {
    const ctx = this.ctx;
    const id = ctx.params.id;
    const updates = {
      mobile: ctx.request.body.mobile,
    };

    try{
      await ctx.service.users.update({ id, updates });
      super.success(ctx.__('updateSuccessful'));
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async destroy() {
    const ctx = this.ctx;
    const id = ctx.helper.parseInt(ctx.params.id);

    try{
      await ctx.service.users.del(id);
      super.success(ctx.__('deletedSuccessful'));
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async updateAcviveByUserId(){
    const ctx = this.ctx;
    const userId = ctx.helper.parseInt(ctx.params.id);

    try{
      await ctx.service.users.updateAcviveByUserId(userId);
      super.success(ctx.__('updateSuccessful'));
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async getCaptcha(){
    let codeConfig = {
        size: 5,// 验证码长度
        ignoreChars: '0o1i', // 验证码字符中排除 0o1i
        noise: 2, // 干扰线条的数量
        height: 44
    }
    var captcha = Captcha.create(codeConfig);
    this.ctx.session.captcha = captcha.text.toLowerCase(); //存session用于验证接口获取文字码

    this.ctx.body = captcha.data;
  }

  async checkCaptcha(){
    const captchaText = this.ctx.query.captchaText;
    if (captchaText.toLowerCase() == this.ctx.session.captcha){
      super.success(this.ctx.__('verificationSuccess'));
    }
    else{
      super.success(this.ctx.__('verificationError'));
    }
  }

  async wxLogin(){
    const code = this.ctx.query.code;
    const state = this.ctx.query.state;
    if (state == 'hello-pinwall'){

      const accessTempObject = await wxUtil.getAccessToken(this.ctx.helper.wx_appid,this.ctx.helper.wx_secret,code);
      const accessObject = JSON.parse(accessTempObject);
      if(!accessObject.errcode){
        const userObject = await wxUtil.getUserInfo(accessObject.access_token,accessObject.openid);
        super.success(userObject);
      }
      else{
        super.failure(accessObject.errmsg);
      }
    }
    else{
      super.failure(this.ctx.__('authError'));
    }
  }

  async getUserByUnionId(){
    const unionId = this.ctx.query.unionId;
    return await ctx.service.users.findByUnionId(unionId);
  }

  async bindWeixin(){
    const ctx = this.ctx;
    const unionId = ctx.user.unionid;
    const user = await ctx.service.users.findByUnionId(unionId);
    if(user){
      if(user.Id && user.mobile){
          ctx.user.Id = user.Id;
          ctx.user.mobile = user.mobile;
          ctx.user.fullname = user.fullname;
          ctx.user.roles = user.roles;
          ctx.user.avatarUrl = user.avatarUrl;
          ctx.redirect('/index');

      }else{
        ctx.redirect('/completeInfo');
      }
    }
    else{
      ctx.redirect('/completeInfo');
    }
  }

  async bindWeixinInfoByMobile(){
    const ctx = this.ctx;
    const mobile = ctx.request.body.mobile;
    const smsCode = ctx.request.body.smsCode;

    const result = await ctx.service.users.bindWeixinInfoByMobile(mobile,smsCode,ctx.user);
    try{
      if (result){
        super.success(ctx.__('bindSuccess'));
      }
      else{
        super.failure(ctx.__('bindFailed'));
      }
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }

  }

  async createWxUser(){
    const ctx = this.ctx;
    const mobile = ctx.request.body.mobile;
    const fullname = ctx.request.body.fullname;
    const password = ctx.request.body.password;
    const captcha = ctx.request.body.captchaText;
    const smsCode = ctx.request.body.smsCode;

    if (captcha == ctx.session.captcha){
      if (ctx.user){
        let user = {
          mobile:mobile,
          fullname:fullname,
          password:password,
          smsCode:smsCode,
          openId:ctx.user.openid,
          nickname:ctx.user.nickname,
          gender:ctx.user.sex,
          city:ctx.user.city,
          province:ctx.user.province,
          country:ctx.user.country,
          avatarUrl:ctx.user.headimageurl,
          unionId:ctx.user.unionid,
        };
        try{
          const result = await ctx.service.users.createUser(user);
          if (result){
            super.success(ctx.__('registerSuccess'));
          }
          else{
            super.failure(ctx.__('registerFailed'));
          }
        }
        catch(e){
          ctx.logger.error(e.message);
          super.failure(e.message);
        }

      }
      else{
        super.failure(ctx.__('weChatError'));
      }
    }
    else{
      super.success(ctx.__('verificationCodeError'));
    }
  }

  async updatePwd(){
    const ctx = this.ctx;
    const password = ctx.request.body.password;
    const newPwd = ctx.request.body.newPwd;
    if(ctx.user){
      const userObject = await ctx.service.users.find(ctx.user.Id);
      const app = this.ctx.helper;
      const crypwd = ctx.helper.cryptoPwd(ctx.helper.cryptoPwd(password));
      if(userObject.password != crypwd){
        super.failure(ctx.__('oldPwdError'));
      }
      else{
        const result = await ctx.service.users.updatePwd(ctx.user.Id, ctx.helper.cryptoPwd(ctx.helper.cryptoPwd(newPwd)));
        if (result){
          super.success(ctx.__('updateSuccessful'));
        }
        else{
          super.failure(ctx.__('updateFailed'));
        }
      }
    }
    else{
      ctx.redirect('/login');
    }
  }

  async updatePwdWithMobileAndSmsCode(){
    const ctx = this.ctx;
    const mobile = ctx.request.body.mobile;
    const smsCode = ctx.request.body.smsCode;
    const newPwd = ctx.request.body.newPwd;
    const result = await ctx.service.users.updatePwdWithMobileAndSmsCode(mobile, smsCode, newPwd);
    if (result.success){
      super.success(ctx.__('updateSuccessful'));
    }
    else{
      super.failure(result.message);
    }
  }

  async updateUserRole(){
    const ctx = this.ctx;
    const userId = ctx.request.body.userId;
    const operation = ctx.request.body.operation;
    const result = await ctx.service.users.updateUserRole(userId,operation);
    if (result){
      super.success(ctx.__('settingSuccessful'));
    }
    else{
      super.failure(ctx.__('settingFailed'));
    }
  }

  async searchByUsername(){
    const ctx = this.ctx;
    const limit = ctx.helper.parseInt(ctx.query.limit);
    const offset = ctx.helper.parseInt(ctx.query.offset);
    const fullname = ctx.query.fullname;
    const query = {
      limit:limit,
      offset:offset,
      fullname:fullname
    };
    try{
      let result = await ctx.service.users.searchByUsername(query);
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(ctx.__('getDataError'));
    }
  }

  async searchByMobile(){
    const ctx = this.ctx;
    const limit = ctx.helper.parseInt(ctx.query.limit);
    const offset = ctx.helper.parseInt(ctx.query.offset);
    const mobile = ctx.query.mobile;
    const query = {
      limit:limit,
      offset:offset,
      mobile:mobile
    };
    try{
      let result = await ctx.service.users.searchByMobile(query);
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(ctx.__('getDataError'));
    }
  }

  async updateUserAvatarUrl(){
    const ctx = this.ctx;
    const userId = ctx.helper.parseInt(ctx.params.id);
    const avatarUrl = ctx.request.body.avatarUrl;

    const data = {
      userId:userId,
      avatarUrl:avatarUrl
    };
    try{
      let result = await ctx.service.users.updateUserAvatarUrl(data);
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(ctx.__('updateDataError'));
    }
  }
}

module.exports = UsersController;

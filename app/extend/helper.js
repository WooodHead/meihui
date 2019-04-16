'use strict';

const crypto = require('crypto');

module.exports = {
  parseInt(string) {
    if (typeof string === 'number') return string;
    if (!string) return string;
    return parseInt(string) || 0;
  },

  jwtSlot: 'LTAIkUgFNkgDjcr8zklMJfJUoAgdcT',

  baseUrl: 'http://127.0.0.1/',
  basePath:'D:\\pinwall',
  topicPath: 'topic',
  userPath: 'user',
  imagePath: 'images',
  othersPath: 'others',
  pdfPath: 'pdf',
  rar_zipPath: 'rar_zip',
  videoPath: 'video',


  es_index:'pinwall_pro_local',
  es_type:'artifacts',

  es_search_suggest_index:'pinwall_pro_local_search_suggest',
  es_search_suggest_type:'pinwall_pro_local_suggest',

  cryptoPwd:(password)=>{
    const prefix = '13640661';
    var sha1 = crypto.createHash('sha1');
    sha1.update(prefix + password);
    var pwd = sha1.digest('hex');
    return pwd;
  },

  randomString: (len)=> {
  　　len = len || 32;
  　　var $chars = 'ABCDEFGHJKMNPQRSTVUWXYZLIabcdefhijkmnpgqvurstwxyz123456789';
  　　var maxPos = $chars.length;
  　　var pwd = '';
  　　for (let i = 0; i < len; i++) {
  　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  　　}
  　　return pwd;
  },

  loginSuccess: (message,token,username,userId)=>{
    const result = {
      'status':200,
      'message':message,
      'token':token,
      'username':username,
      'userId':userId,
    };
    return result;
  },

  expireToken:(message,token)=>{
    const result = {
      'status':409,
      'message':message,
      'token':token
    };
    return result;
  },

  randomNumber:(num)=>{
    var str = '';
    for(var i = 0; i < num; i += 1){
      str += Math.floor(Math.random() * 10);
    }
    return str;
  },

  judgeImageStringInArrayObject:(str,array)=>{
    let  result = true;
    for(const updateAssets of array){
      if (str == updateAssets.profileImage){
        result = false;
        break;
      }
    }
    return result;
  },

  judgeMediaStringInArrayObject:(str,array)=>{
    let  result = true;
    for(const updateAssets of array){
      if (str == updateAssets.mediaFile){
        result = false;
        break;
      }
    }
    return result;
  }
};

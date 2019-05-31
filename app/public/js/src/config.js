var config = {
    // 数据请求url
    ajaxUrls: {
        getIndexData: "/website/artifacts/getMedalDataByRandom/{num}",
        // TopicAbout
        getTopicAboutData: "/website/topics",
        // topics
        getTopicsData:"/website/topics",
        // search
        searchByKeywords:'/website/search/searchByKeywords',
        suggestKeyWords: '/website/search/suggestKeyWords',
        suggestKeyWordsWithJobtag: '/website/search/suggestKeyWordsWithJobtag',
        searchByKeywordsAndJobtag: '/website/search/searchByKeywordsAndJobtag',
        searchByUsername:'/website/users/searchByUsername',
        searchByMobile:'/website/users/searchByMobile',
        searchArtifactsByNameOrTermName:'/website/search/searchArtifactsByNameOrTermName',
        searchComment:'/website/artifactComment/searchComment',
        // workFolder
        getTopicAndArtifactById:'/website/topics/getTopicAndArtifactById',
        // uploadWork
        getUrlSignature:'/getUrlSignature',
        getSTSSignature:'/getSTSSignature/:type',
        uploadFile:"/website/file/uploadFile/:type",
        // artifacts
        getArtifacts:'/website/artifacts',
        getArtifactsWithId:'/website/artifacts/:id',
        getPersonalJob: "/website/artifacts/getPersonalJob", //获取我的作品集
        getPersonalJobByUserId: "/website/artifacts/getPersonalJobByUserId", //获取别人的作品集
        updateVisibleById: "/website/artifacts/updateVisibleById/:id",
        // user
        createUser:'/website/users/createUser',
        getUserData:"/website/users",
        updatePwdWithEmailAndActiveCode:'/website/users/updatePwdWithEmailAndActiveCode',
        updateUserRole:'/website/users/updateUserRole',
        getCaptcha:'/getCaptcha',
        checkCaptcha:'/checkCaptcha',
        createWxUser:"/website/users/createWxUser",
        bindWeixinInfoByMobile:"/website/users/bindWeixinInfoByMobile",
        updatePwd:"/website/users/updatePwd",
        updatePwdWithMobileAndSmsCode:'/website/users/updatePwdWithMobileAndSmsCode',
        updateUserAvatarUrl:"/website/users/updateUserAvatarUrl/:id",
        //searchEngine
        transterInsertDataToES:'/website/artifacts/transterInsertDataToES',
        transterUpdateDataToES:'/website/artifacts/transterUpdateDataToES',
        //手机短信接口
        createSmsMessage:"/sms/createSmsMessage?mobile=",
        vertifySms:"/sms/vertifySms"
    },
    viewUrl:{
        workFolder:'/workFolder/:id',
        uploadWork:'/uploadWork/1?topicId=:id',
        topicsUpdate:'/topicsUpdate/:id'
    },
    default_profile: "../public/images/default_profile.jpg"
}

var lang = document.cookie.split("=")[1];           //当前浏览器语言

$(document).ready(function() {
    var baseUrl = new String();
    if(window.location.href.indexOf("&locale=") > 0){   //已经进行过一次语言转化
        baseUrl =  window.location.href.split("&locale")[0];
    }else if(window.location.href.indexOf("?locale=") > 0){
        baseUrl =  window.location.href.split("?locale")[0];
    }else{
        baseUrl = window.location.href;
    }


    if(lang == "zh-cn"){
        $(".lang_zh").addClass('active');
        $(".lang_en").removeClass('active');
    }else if(lang == "en-us"){
        $(".lang_en").addClass('active');
        $(".lang_zh").removeClass('active');
    }

    $(".lang_zh").click(function(event) {
        if (baseUrl.indexOf("?") > 0) {    //链接上？后面有参数
            window.location.href = baseUrl + "&locale=zh-CN";
        } else {
            window.location.href = baseUrl + "?locale=zh-CN";
        }
    });

    $(".lang_en").click(function(event) {
        if (baseUrl.indexOf("?") > 0) {    //链接上？后面有参数
            window.location.href = baseUrl + "&locale=en-US";
        } else {
            window.location.href = baseUrl + "?locale=en-US";
        }
    });
});

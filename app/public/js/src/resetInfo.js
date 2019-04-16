
var index = new Vue({
    el: '.index',
    data(){
        return{
            containerStyle:{
                minHeight:"",
            },
            avatarName:"",
            avatarUrl:"",
            pwdItem:{
                password:"",
                newPwd:"",
                confirmPassword:""
            },
            drawerShow:false,
            restDisabled:true,
            ruleValidate:{
                password:[
            	    {required: true, message: '请输入密码', trigger: 'blur'},
              	    {min:6, message: '密码至少为6位', trigger: 'blur'}
            	],
                newPwd:[
                    {required: true, message: '请输入密码', trigger: 'blur'},
              	    {min:6, message: '密码至少为6位', trigger: 'blur'}
                ],
            	confirmPassword:[
            	    {required: true, message: '请输入密码', trigger: 'change'},
              	    {min:6, message: '密码至少为6位', trigger: 'change'}
            	]
            },
            locale:1    //中英文 1:中文
        }
    },
    methods: {
        uploadAvatarChange(files){
            let that = this;
            let file = files.target.files[0];
            let fileSize = files.target.files[0].size/1024;
            if(fileSize <= 100){
                this.$Notice.success({title:this.locale ? '上传中···' : 'uploading...'});
                let formdata = new FormData();
                formdata.append('head', file);
                $.ajax({
                    url: config.ajaxUrls.uploadFile.replace(":type",5),
                    type: 'POST',
                    cache: false,
                    processData: false,
                    contentType: false,
                    data: formdata,
                    success(res){
                        if(res.status == 200){
                            let img = new Image();
                            img.src = res.url;
                            img.onload = function(){
                                if(img.width == img.height &&img.width <= 100){
                                    that.$Notice.success({title:that.locale ? '上传成功！' : "Upload successful!"});
                                    that.avatarUrl = res.url;
                                    that.avatarName = res.fileName;
                                }else{
                                    that.$Notice.error({title:that.locale ? "图片尺寸过大(100*100)！，请重新上传……" : "The picture size is too large (100*100)!Please upload again..."});
                                }
                            }
                        }else if(res.status == 500){
                            that.$Notice.error({title:that.locale ? "上传出错!" : "Upload error!"});
                        }else if(res.status == 999){
                            that.$Notice.error({title:res.data.message});
                        }
                    }
                })
            }else{
                this.$Notice.error({title:this.locale ? "图片内存过大(100Kb)，请重新选择!" : "Image memory too large (100Kb), please reselect!"});
            }
        },
        submitUserAvatar(userId){
            let that = this;
            $.ajax({
                url: config.ajaxUrls.updateUserAvatarUrl.replace(":id",userId),
                type: "PUT",
                data: {avatarUrl: this.avatarName},
                success(res){
                    if(res.status == 200){
                        that.$Notice.success({title:that.locale ? '操作成功!' : 'Successful operation!'});
                        that.fileName = "";
                    }else{
                        that.$Notice.error({title:res.message});
                    }
                }
            })
        },
        conPwdBlur(){
            if (this.pwdItem.newPwd.length >= 6) {
                if(this.pwdItem.newPwd && this.pwdItem.confirmPassword != this.pwdItem.newPwd){
        			this.$Notice.error({ title:this.locale ? '输入的两次新密码不一致!' : 'The two new passwords entered do not match!', duration:3});
                    this.pwdItem.newPwd = "";
                    this.pwdItem.confirmPassword = "";
                    this.restDisabled = true;
        		}else {
                    this.restDisabled = false;
                }
            }else {
                this.pwdItem.newPwd = "";
                this.pwdItem.confirmPassword = "";
                this.restDisabled = true;
            }
        },
        restPwd(){
            let that = this;
            this.$Loading.start();
            $.ajax({
                url: config.ajaxUrls.updatePwd,
                type: 'PUT',
                data: this.pwdItem,
                success(res){
                    if (res.status == 200) {
                        that.$Loading.finish();
                        that.$Notice.success({
                            title:res.data,
                            duration:1,
                            onClose(){
                                window.location.href = "/resetInfo";
                            }
                        })
                    }else{
                        that.$Loading.error();
                        that.$Notice.error({
                            title:res.data
                        })
                    }
                }
            });
        }
    },
    created(){
        if(document.cookie.split("=")[1] == "en-us"){
            this.locale = 0;
        }else{
            this.locale = 1;
        }
        this.containerStyle.minHeight = document.documentElement.clientHeight - 140 + "px";
    }
})
$(document).ready(function(){
    //用户头像上传
    $('.uploadAvatar').click(function(){
        $('.uploadAvatar_input').click();
    });
});

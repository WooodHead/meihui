var index = new Vue({
    el: '.index',
    data(){
        return{
            containerStyle:{
                "margin":"",
            },
            drawerShow:false,
            disableCodeBtn:false,
            disabledBtn:true,
            mobileCodeText:"",
            mobile:"",
            smsCode:"",

            // 新密码
            showUpdataData:false,//验证通过显示密码输入框
            password:"",
            confirmPassword:"",
            locale:1,               //中英文 1：中文
        }
    },
    methods: {
        //发送手机验证短信
    	sendAcodeStg:function(){
    		var that = this;
    		this.$Loading.start();
            var usernameExp = /^1[3|4|5|7|8][0-9]{9}$/;
    		if(usernameExp.test(this.mobile)){
    			var url = config.ajaxUrls.createSmsMessage + this.mobile;
    			$.ajax({
                    dataType:"json",
                    type:"get",
                    url:url,
                    success:function(res){
                        if(res.status == 200){
                    		that.$Loading.finish();
                        	that.$Notice.success({title:res.data, duration:3});
                        	clock(that);
                        }else{
                    		that.$Loading.error();
                        	that.$Notice.error({title:res.data, duration:3});
                        }
                    },
                    error:function(){
                		that.$Loading.error();
                    	that.$Notice.error({title:that.locale ? "网络异常，请稍后重试！" : "Network error, please try again later!", duration:3});
                    }
                })
    		}else if(this.mobile.length == 0){
        		that.$Loading.error();
    			that.$Notice.error({title:that.locale ? "请输入手机号!" : "Please enter your mobile phone number!", duration:3});
    		}
    	},
        //验证手机验证码
    	checkMobileCode(event){
            if(event.target.value.length == 6){
                var that = this,
    			url = config.ajaxUrls.vertifySms;
        		$.ajax({
                    dataType:"json",
                    type:"GET",
                    url:url,
                    data:{mobile:this.mobile,smsCode:this.smsCode},
                    success:function(res){
                        if(res.status == 200){
                        	that.$Notice.success({title:res.data, duration:3});
                            that.showUpdataData = true;
                        }else{
                        	that.$Notice.error({title: that.locale ? "手机号码为空或者验证码失效!" : "The cell phone number is empty or the verification code is invalid!", duration:3});
                        }
                    },
                    error:function(){
                    	that.$Notice.error({title: that.locale ? "网络异常，请稍后重试!" : "Network error, please try again later!", duration:3});
                    }
                })
            }
    	},
        conPwdBlur(){
            if(this.password && this.confirmPassword != this.password){
    			this.$Notice.error({ title: this.locale ? '输入的密码不一致' : "The passwords entered are inconsistent", duration:3});
                this.password = "";
                this.confirmPassword = "";
    		}else if(this.password && this.confirmPassword == this.password){
                this.disabledBtn = false;
            }
        },
        submit(){
            let that = this;
            this.$Loading.start();
            $.ajax({
                url: config.ajaxUrls.updatePwdWithMobileAndSmsCode,
                type: 'PUT',
                data:{
                    mobile:this.mobile,
                    smsCode:this.smsCode,
                    newPwd:this.password
                },
                success(res){
                    if (res.status == 200) {
                        that.$Loading.finish();
                        that.$Notice.success({
                            title:res.data,
                            onClose(){
                                window.location.href = "/login";
                            }
                        })
                    } else if (res.status == 500) {
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
            this.mobileCodeText = "Click to get the verification code"
        }else{
            this.locale = 1;
            this.mobileCodeText = "点击获取验证码"
        }
        this.containerStyle.margin = (document.documentElement.clientHeight - 400 ) / 2 - 90 + "px auto";
    }
})
function clock(that){
	var num = 60;
	var int = setInterval(function(){
		num > 0 ? num-- : clearInterval(int);
		that.mobileCodeText = num + that.locale ? "秒后重试" : "seconds later do again";
		that.disableCodeBtn = true;
		if(num == 0){
			that.mobileCodeText = that.locale ? "点击获取验证码" : "Click to get the verification code";
    		that.disableCodeBtn = false;
		}
	},1000);
}

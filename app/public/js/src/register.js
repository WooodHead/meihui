
var index = new Vue({
    el: '.index',
    data(){
        return{
            containerStyle:{
                "margin":"",
            },
            drawerShow:false,
            formItem:{
                fullname:"",
                mobile:"",
                smsCode:"",
                password:"",
                captchaText:""
            },
            cloak:false,
            disableCodeBtn:false,
            captchaBol:false,
            mobileCodeText:"",
            ruleValidate:{
                fullname:{required: true, message: '用户名不能为空', trigger: 'blur'},
                mobile:[
        	       {required: true, message: '手机号码不能为空', trigger: 'blur'},
        	       {required: true, len:11, message: '请输入正确手机号码格式', trigger: 'blur'}
            	],
                smsCode:[
					{required: true, message: '请输入验证码', trigger: 'blur'},
					{len:6, message: '验证码为6位', trigger: 'blur'}
            	],
                password:[
            	    {required: true, message: '请输入密码', trigger: 'blur'},
              	    {min:6, message: '密码至少为6位', trigger: 'blur'}
            	],
            	confirmPassword:[
            	    {required: true, message: '请输入密码', trigger: 'blur'},
              	    {min:6, message: '密码至少为6位', trigger: 'blur'}
            	]
            },
            locale:1        //中英文 1：中文
        }
    },
    computed:{
        disabledBtn(){
            if (this.cloak && this.formItem.smsCode.length == 6 && this.formItem.fullname && this.formItem.mobile && this.formItem.password && this.captchaBol) {
                return false;
            } else {
                return true;
            }
        }
    },
    methods: {
        tapClick(){
            let that = this;
            $.ajax({
                url: config.ajaxUrls.getCaptcha,
                type: 'GET',
                success(res){
                    document.getElementsByTagName("object")[0].innerHTML = res;
                }
            });
        },
        //发送手机验证短信
    	sendAcodeStg:function(){
    		var that = this;
    		this.$Loading.start();
    		if(this.formItem.mobile.length == 11){
    			var url = config.ajaxUrls.createSmsMessage + this.formItem.mobile;
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
    		}else if(this.formItem.mobile.length == 0){
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
                    data:{mobile:this.formItem.mobile,smsCode:this.formItem.smsCode},
                    success:function(res){
                        if(res.status == 200){
                        	that.$Notice.success({title:res.data, duration:3});
                            that.cloak = true;
                        }else{
                        	that.$Notice.error({title:res.data, duration:3});
                        }
                    },
                    error:function(){
                    	that.$Notice.error({title:that.locale ? "网络异常，请稍后重试!" : "Network error, please try again later!", duration:3});
                    }
                })
            }
    	},
        conPwdBlur(){
            if(this.formItem.password && this.formItem.confirmPassword != this.formItem.password){
    			this.$Notice.error({ title: this.locale ? "输入的密码不一致!" : "The passwords entered are inconsistent!", duration:3});
                this.formItem.password = "";
                this.formItem.confirmPassword = "";
    		}
        },
        checkCaptcha(event){
            let that = this;
            if(event.target.value.length == 5){
                $.ajax({
                    url: config.ajaxUrls.checkCaptcha,
                    type: 'GET',
                    data:{captchaText:this.formItem.captchaText},
                    success(res){
                        if (res.status == 200){
                            that.$Notice.success({title:res.data});
                            that.captchaBol = true;
                        }else{
                            that.$Notice.error({title:res.data});
                            that.captchaBol = false;
                        }
                    }
                });
            }
        },
        registerSubmit(){
            let that = this;
            this.$Loading.start();
            $.ajax({
                url: config.ajaxUrls.createUser,
                type: 'POST',
                data: this.formItem,
                success(res){
                    if (res.status == 200) {
                        console.log(res);
                        that.$Loading.finish();
                        that.$Notice.success({
                            title:res.data,
                            duration:3,
                            onClose(){
                                window.location.href = "/login";
                            }
                        })
                    }else {
                        that.$Loading.error();
                        that.$Notice.error({title:res.data});
                    }
                }
            });
        }
    },
    created(){
        if(document.cookie.split("=")[1] == "en-us"){
            this.locale = 0;
            this.mobileCodeText = "Click to get the verification code";
        }else{
            this.locale = 1;
            this.mobileCodeText = "点击获取验证码";
        }
        let clientWidth = document.documentElement.clientWidth;
        let clientHeight = document.documentElement.clientHeight;
        if (clientHeight < 600) {
            this.containerStyle.margin = "0px auto";
        } else {
            this.containerStyle.margin = (clientHeight - 480 ) / 2 - 90 + "px auto";
        }
        let that = this;
        $.ajax({
            url: config.ajaxUrls.getCaptcha,
            type: 'GET',
            success(res){
                document.getElementsByTagName("object")[0].innerHTML = res;
            }
        });
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

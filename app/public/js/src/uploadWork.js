var container = new Vue({
    el: '.index',
    data(){
        return{
            locale:1,                      //当前浏览器语言
            containerStyle:{
                minHeight:"",
            },
            step1_upload_fengmian_src:"",   //封面图片路径(阿里返回路径)
            step2_upload_neirong_src:[],    //列表图片上传列表
            yulan_img:"",                   //步骤二图片预览img的src
            dataItem:{
                Id:"",
                topicId:"",
                name:"",                    //作品名
                description:"",             //描述
                profileImage:"",            //封面图
                jobTag:"",                  //0 作品集 1 作业荚
                artifact_assets:[],         //详情数组
                terms:[],                    //标签数组
            },
            ruleValidate:{
                name:[
                    {required: true, message: '用户名不能为空', trigger: 'blur'},
                    {type: 'string', max: 130, message: '字数请控制在130之内', trigger: 'blur' }
                ],
                description:{required: true, message: '内容说明不能为空', trigger: 'blur'},
                profileImage:{required: true}
            },
            step2_between_arr:[],           //存放step2的数据数组 最后赋值给dataitem
            which_artifact_assets:"",
            file_otherinof_arr:[],         //附加信息
            neirong_truename_arr:[],
            terms_value:"",
            terms_arr:[],
            addTerms:[],
            deleteTerms:[],
            upload_show:false,
            drawerShow:false,
            stepOneActive:true,
            stepTwoActive:false,
            stepThreeActive:false,
            jobTagName:"",
        }
    },
    methods: {
        keyDownEvent(){},
        /**
         * 步骤一：上传作品封面事件
         */
        step1_upload_fengmian_change(files){
            let that = this;
            let file = files.target.files[0];
            let fileSize = files.target.files[0].size/1048576;
            if (fileSize <= 2) {
                this.$Notice.success({title:this.locale ? '上传中···' : "uploading..."});
                let formdata = new FormData();
                formdata.append('head', file);
                $.ajax({
                    url: config.ajaxUrls.uploadFile.replace(":type",1),
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
                                if(img.width == img.height && img.width >= 600 && img.width <= 800){
                                    that.$Notice.success({title:that.locale ? '上传成功！' : 'Successful operation!'});
                                    that.step1_upload_fengmian_src = res.url;
                                    that.dataItem.profileImage = res.fileName;
                                }else{
                                    that.$Notice.error({title:that.locale ? "图片不符合尺寸要求！，请重新上传……" : "The picture does not meet the size requirement!Please upload again..."});
                                }
                            }
                        }else if(res.status == 500){
                            that.$Notice.error({title: that.locale ? "上传出错" : "Operation failed!"});
                        }else if(res.status == 999){
                            that.$Notice.error({title:res.data.message});
                        }
                    }
                })
            }else{
                this.$Notice.error({title:this.locale ? "图片大小不符，请重新选择" : "The picture size does not match, please choose again!"});
            }
        },
        step2_upload_neirong_change(files){
            let that = this;
            let file = files.target.files[0];
            this.$Notice.success({title:this.locale ? '上传中···' : "uploading..."});

            let formdata = new FormData();
            formdata.append('head', file);
            $.ajax({
                url: config.ajaxUrls.uploadFile.replace(":type",1),
                type: 'POST',
                cache: false,
                processData: false,
                contentType: false,
                data: formdata,
                success(res){
                    if(res.status == 200){
                        that.$Notice.success({title:that.locale ? '上传成功！' : 'Successful operation!'});
                        that.step2_upload_neirong_src = that.step2_upload_neirong_src.concat(res.url);

                        let subarr = new Object();
                        if (that.dataItem.Id) {
                            subarr.position = that.step2_upload_neirong_src.length - 1;
                        }else if(that.dataItem.topicId){
                            subarr.position = that.step2_upload_neirong_src.length - 1;
                        }else if(that.dataItem.jobTag == 2){
                            subarr.position = that.step2_upload_neirong_src.length - 1;
                        }else{
                            subarr.position = "";
                        }
                        subarr.name = "";
                        subarr.filename = "";
                        subarr.imagename = files.target.files[0].name;
                        subarr.description = "";
                        subarr.type = 1;
                        subarr.profileImage = res.fileName;
                        subarr.mediaFile = "";
                        subarr.viewUrl = "";
                        subarr.viewImgUrl = res.url;
                        that.step2_between_arr.push(subarr);

                        let progress_subarr = new Object();
                        progress_subarr.progress = 0;
                        progress_subarr.fileTrueName = "";
                        that.file_otherinof_arr.push(progress_subarr);
                        that.neirong_truename_arr.push(files.target.files[0].name);
                    }else if(res.status == 500){
                        that.$Notice.error({title: that.locale ? "上传出错" : "Operation failed!"});
                    }else if(res.status == 999){
                        that.$Notice.error({title:res.data.message});
                    }

                }
            })
        },
        /**
         * 更换图片
         */
        step2_upload_change(files){
            let that = this;
            let file = files.target.files[0];
            this.$Notice.success({title:this.locale ? '上传中···' : "uploading..."});

            let formdata = new FormData();
            formdata.append('head', file);
            $.ajax({
                url: config.ajaxUrls.uploadFile.replace(":type",1),
                type: 'POST',
                cache: false,
                processData: false,
                contentType: false,
                data: formdata,
                success(res){
                    if(res.status == 200){
                        that.$Notice.success({title:that.locale ? '上传成功！' : 'Successful operation!'});
                        that.step2_upload_neirong_src.splice(that.which_artifact_assets,1,res.url);
                        that.step2_between_arr[that.which_artifact_assets].imagename = files.target.files[0].name;
                        that.step2_between_arr[that.which_artifact_assets].viewImgUrl = res.url;
                        that.step2_between_arr[that.which_artifact_assets].profileImage = res.fileName;
                        that.neirong_truename_arr[that.which_artifact_assets] = files.target.files[0].name;
                    }else if(res.status == 500){
                        that.$Notice.error({title: that.locale ? "上传出错" : "Operation failed!"});
                    }else if(res.status == 999){
                        that.$Notice.error({title:res.data.message});
                    }
                }
            })
        },
        step2_upload_MP4_change(files){
            let that = this;
            let file = files.target.files[0];
            let fileTrueName = files.target.files[0].name;
            let fileSize = files.target.files[0].size/1048576;
            if (fileSize <= 300) {
                this.file_otherinof_arr[this.which_artifact_assets].fileTrueName = files.target.files[0].name;
                this.$Notice.success({title:this.locale ? '上传中···' : "uploading..."});

                let formdata = new FormData();
                formdata.append('head', file);
                $.ajax({
                    url: config.ajaxUrls.uploadFile.replace(":type",4),
                    type: 'POST',
                    cache: false,
                    processData: false,
                    contentType: false,
                    data: formdata,
                    xhr(){
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function(evt){
                            var percentComplete = event.loaded / event.total;
                            that.file_otherinof_arr[that.which_artifact_assets].progress = (percentComplete * 100).toFixed(2);
                        }, false);
                        return xhr;
                    },
                    success(res){
                        if(res.status == 200){
                            that.$Notice.success({title:that.locale ? '上传成功！' : 'Successful operation!'});
                            that.step2_between_arr[that.which_artifact_assets].position = that.which_artifact_assets;
                            that.step2_between_arr[that.which_artifact_assets].type = 4;
                            that.step2_between_arr[that.which_artifact_assets].mediaFile = res.fileName;
                            that.step2_between_arr[that.which_artifact_assets].viewUrl = res.fileName;
                            that.step2_between_arr[that.which_artifact_assets].filename = files.target.files[0].name;
                        }else if(res.status == 500){
                            that.$Notice.error({title: that.locale ? "上传出错" : "Operation failed!"});
                        }else if(res.status == 999){
                            that.$Notice.error({title:res.data.message});
                        }
                    }
                })
            }else{
                this.$Notice.error({title:this.locale ? "附件内存过大，请重新选择！" : "Attachment memory is too large, please upload again!"});
            }
        },
        step2_upload_PDF_change(files){
            let that = this;
            let file = files.target.files[0];
            let fileTrueName = files.target.files[0].name;
            let fileSize = files.target.files[0].size/1048576;
            if (fileSize <= 300) {
                this.file_otherinof_arr[this.which_artifact_assets].fileTrueName = files.target.files[0].name;

                this.$Notice.success({title:this.locale ? '上传中···' : "uploading..."});

                let formdata = new FormData();
                formdata.append('head', file);
                $.ajax({
                    url: config.ajaxUrls.uploadFile.replace(":type",2),
                    type: 'POST',
                    cache: false,
                    processData: false,
                    contentType: false,
                    data: formdata,
                    xhr(){
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function(evt){
                            var percentComplete = event.loaded / event.total;
                            that.file_otherinof_arr[that.which_artifact_assets].progress = (percentComplete * 100).toFixed(2);
                        }, false);
                        return xhr;
                    },
                    success(res){
                        if(res.status == 200){
                            that.$Notice.success({title:that.locale ? '上传成功！' : 'Successful operation!'});
                            that.step2_between_arr[that.which_artifact_assets].position = that.which_artifact_assets;
                            that.step2_between_arr[that.which_artifact_assets].type = 2;
                            that.step2_between_arr[that.which_artifact_assets].mediaFile = res.fileName;
                            that.step2_between_arr[that.which_artifact_assets].viewUrl = res.fileName;
                            that.step2_between_arr[that.which_artifact_assets].filename = files.target.files[0].name;
                        }else if(res.status == 500){
                            that.$Notice.error({title: that.locale ? "上传出错" : "Operation failed!"});
                        }else if(res.status == 999){
                            that.$Notice.error({title:res.data.message});
                        }
                    }
                })
            }else{
                this.$Notice.error({title:this.locale ? "附件内存过大，请重新选择！" : "Attachment memory is too large, please upload again!"});
            }
        },
        step2_upload_ZIP_change(files){
            let that = this;
            let file = files.target.files[0];
            let fileTrueName = files.target.files[0].name;
            let fileSize = files.target.files[0].size/1048576;
            if (fileSize <= 300) {
                this.file_otherinof_arr[this.which_artifact_assets].fileTrueName = files.target.files[0].name;

                this.$Notice.success({title:this.locale ? '上传中···' : "uploading..."});

                let formdata = new FormData();
                formdata.append('head', file);
                $.ajax({
                    url: config.ajaxUrls.uploadFile.replace(":type",3),
                    type: 'POST',
                    cache: false,
                    processData: false,
                    contentType: false,
                    data: formdata,
                    xhr(){
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function(evt){
                            var percentComplete = event.loaded / event.total;
                            that.file_otherinof_arr[that.which_artifact_assets].progress = (percentComplete * 100).toFixed(2);
                        }, false);
                        return xhr;
                    },
                    success(res){
                        if(res.status == 200){
                            that.$Notice.success({title:that.locale ? '上传成功！' : 'Successful operation!'});
                            that.step2_between_arr[that.which_artifact_assets].position = that.which_artifact_assets;
                            that.step2_between_arr[that.which_artifact_assets].type = 3;
                            that.step2_between_arr[that.which_artifact_assets].mediaFile = res.fileName;
                            that.step2_between_arr[that.which_artifact_assets].viewUrl = res.fileName;
                            that.step2_between_arr[that.which_artifact_assets].filename = files.target.files[0].name;
                        }else if(res.status == 500){
                            that.$Notice.error({title: that.locale ? "上传出错" : "Operation failed!"});
                        }else if(res.status == 999){
                            that.$Notice.error({title:res.data.message});
                        }
                    }
                })
            }else{
                this.$Notice.error({title:this.locale ? "附件内存过大，请重新选择！" : "Attachment memory is too large, please upload again!"});
            }
        },
        /**
         * 添加标签
         */
        createTerm(){
            if (this.dataItem.Id) {
                let XO = true;
                for(let i=0;i<this.terms_arr.length;i++){
                    if (this.terms_arr[i].name == this.terms_value) {
                        XO = false;
                        this.terms_value = "";
                        this.$Notice.error({title: this.locale ? "该标签已添加" : "The label has been added!"});
                    }
                }
                if(this.terms_value && XO){
                    let aa = new Object();
                    aa.name = this.terms_value;
                    this.terms_arr.push(aa);
                    this.addTerms.push(aa);
                    this.terms_value = "";
                }
            }else{
                // 新建
                let XO = true;
                for(let i=0;i<this.terms_arr.length;i++){
                    if (this.terms_arr[i].name == this.terms_value) {
                        XO = false;
                        this.$Notice.error({title: this.locale ? "该标签已添加" : "The label has been added!"});
                    }
                }
                if(this.terms_value && XO){
                    let subterm = new Object();
                    subterm.name = this.terms_value;
                    this.terms_arr.push(subterm);
                    this.terms_value = "";
                }
            }
        },
        /**
         * 删除标签
         */
        deleteLabel(index){
            if (this.dataItem.Id) {
                let XO = false;
                for (var i = 0; i < this.dataItem.terms.length; i++) {
                    if (this.terms_arr[index].name == this.dataItem.terms[i].name) {
                        XO = true;
                        break;
                    }
                }
                if(XO){
                    this.deleteTerms.push(this.terms_arr[index].Id);
                    this.terms_arr.splice(index,1);
                }
            }else{
                this.terms_arr.splice(index,1);
            }
        },
        /**
         * 步骤二：点击左侧列表，控制图片预览src
         */
        selectLi(index){
            this.upload_show = true;
            this.yulan_img = this.step2_upload_neirong_src[index];
            this.which_artifact_assets = index;
        },
        /**
         * 步骤二：点击列表删除
         */
        deleteUploadImg(index){
            this.step2_upload_neirong_src.splice(index,1);
            this.step2_between_arr.splice(index,1);
            this.file_otherinof_arr.splice(index,1);
            this.neirong_truename_arr.splice(index,1);
            if (this.step2_upload_neirong_src.length == 0) {
                this.upload_show = false;
            }
            for(let i=index; i<this.step2_upload_neirong_src.length;i++){
                this.step2_between_arr[i].position = this.step2_between_arr[i].position - 1;
            }
        },
        /* 步骤调整事件 */
        goStep1(){
            this.stepOneActive = true;
            this.stepTwoActive = false;
            this.stepThreeActive = false;
        },
        goStep2(){
            if (this.dataItem.name && this.dataItem.description && this.dataItem.profileImage) {
                if(this.dataItem.Id){
                    this.dataItem.addTerms = this.addTerms;
                    this.dataItem.deleteTerms = this.deleteTerms;
                }
                this.stepOneActive = false;
                this.stepTwoActive = true;
                this.stepThreeActive = false;
                this.dataItem.terms = this.terms_arr;
            }else{
                this.$Notice.error({title: this.locale ? "请输入必填信息！" : "Please enter required information!"});
            }

        },
        goStep3(){
            if (this.step2_upload_neirong_src.length) {
                this.stepOneActive = false;
                this.stepTwoActive = false;
                this.stepThreeActive = true;
                this.dataItem.artifact_assets = this.step2_between_arr;
            }else{
                this.$Notice.error({title: this.locale ? "请输入必填信息！" : "Please enter required information!"});
            }
        },
        submitData(){
            let that = this;
            this.$Loading.start();
            if (this.dataItem.Id) {
                $.ajax({
                    url: config.ajaxUrls.getArtifactsWithId.replace(":id",this.dataItem.Id),
                    method:"PUT",
                    data:this.dataItem,
                    success:function(res){
                        that.$Loading.finish();
                        if (res.status == 200) {
                            that.$Notice.success({
                                title:that.locale ? "上传作品成功，2秒后返回!" : "Successful upload, return 2 seconds later!",
                                duration:2,
                                onClose(){
                                    self.location = document.referrer;
                                }
                            });
                        }else if (res.status == 500) {
                            that.$Notice.error({title:res.data});
                        }
                    }
                })
            }else{
                $.ajax({
                    url: config.ajaxUrls.getArtifacts,
                    method:"POST",
                    data:this.dataItem,
                    success:function(res){
                        that.$Loading.finish();
                        if (res.status == 200) {
                            that.$Notice.success({
                                title:that.locale ? "上传作品成功，2秒后返回!" : "Successful upload, return 2 seconds later!",
                                duration:2,
                                onClose(){
                                    self.location = document.referrer;
                                }
                            });
                        }else if (res.status == 500) {
                            that.$Notice.error({title:res.data});
                        }
                    }
                })
            }
        }
    },
    created(){
        let that = this;
        if(document.cookie.split("=")[1] == "en-us"){
            this.locale = 0;
        }else{
            this.locale = 1;
        }
        this.containerStyle.minHeight = document.documentElement.clientHeight - 140 + "px";

        if(window.location.href.indexOf("editUploadWork") > 0){
            this.dataItem.Id = window.location.search.split("?id=")[1].split("&jobTag=")[0];
            this.dataItem.jobTag = window.location.search.split("?id=")[1].split("&jobTag=")[1];
            if(this.dataItem.jobTag == 1){
                this.jobTagName = this.locale ? "的作业" : "'s works";
            }else{
                this.jobTagName = this.locale ? "的作品集" : "'s sample reels";
            }
            $.ajax({
                url: config.ajaxUrls.getArtifactsWithId.replace(":id",this.dataItem.Id),
                type: 'GET',
                success(res){
                    that.dataItem.name = res.data.name;
                    that.dataItem.artifact_assets = res.data.artifact_assets;
                    that.dataItem.description = res.data.description;

                    that.step1_upload_fengmian_src = res.data.profileImage;
                    that.dataItem.profileImage = res.data.profileImage.split("/")[res.data.profileImage.split("/").length - 1];

                    that.dataItem.terms = res.data.terms;
                    for(let i=0;i<res.data.terms.length;i++){
                        let term = new Object();
                        term = res.data.terms[i];
                        that.terms_arr.push(term);
                    }

                    for (var i = 0; i < res.data.artifact_assets.length; i++) {
                        that.step2_upload_neirong_src.push(res.data.artifact_assets[i].profileImage);

                        let bet = new Object();
                        bet.position = res.data.artifact_assets[i].position;
                        bet.name = res.data.artifact_assets[i].name;
                        bet.filename = res.data.artifact_assets[i].filename;
                        bet.imagename = res.data.artifact_assets[i].imagename;
                        bet.description = res.data.artifact_assets[i].description;
                        bet.type = res.data.artifact_assets[i].type;
                        bet.profileImage = res.data.artifact_assets[i].profileImage.split("/")[res.data.artifact_assets[i].profileImage.split("/").length - 1];
                        bet.mediaFile = res.data.artifact_assets[i].mediaFile.split("/")[res.data.artifact_assets[i].mediaFile.split("/").length - 1];
                        bet.viewUrl = res.data.artifact_assets[i].viewUrl;
                        bet.viewImgUrl = res.data.artifact_assets[i].profileImage;
                        that.step2_between_arr.push(bet);

                        let other = new Object();
                        other.fileTrueName = res.data.artifact_assets[i].filename;
                        other.progress =  res.data.artifact_assets[i].mediaFile ? '100' : "0";
                        that.file_otherinof_arr.push(other);

                        that.neirong_truename_arr.push(res.data.artifact_assets[i].imagename);
                    }
                }
            });
        }else if(window.location.href.indexOf("topicId") > 0){
            this.dataItem.jobTag = window.location.href.split("uploadWork/")[1].split("?")[0];
            this.dataItem.topicId = window.location.href.split("topicId=")[1];
            if(this.dataItem.jobTag == 1){
                this.jobTagName = this.locale ? "的作业" : "'s works";
            }else{
                this.jobTagName = this.locale ? "的作品集" : "'s sample reels";
            }
        }else{
            this.dataItem.jobTag = window.location.href.split("uploadWork/")[1].split("?")[0];
            this.dataItem.topicId = 0;
            if(this.dataItem.jobTag == 1){
                this.jobTagName = this.locale ? "的作业" : "'s works";
            }else{
                this.jobTagName = this.locale ? "的作品集" : "'s sample reels";
            }
        }
    }
})

$(document).ready(function(){

    $('#step1_upload_fengmian').click(function(){
        $('#step1_upload_fengmian_input').click();
    });
    //作品内容图片上传
    $('#step2_upload_btn').click(function(){
        $('#step2_upload_input').click();
    });
    //step2作品内容图片更换事件
    $('.step2_change_upload_btn').click(function(){
        $('.step2_change_upload_input').click();
    });
    /**
     * step2 附件选择上传
     */
    $('#step2_upload_MP4_btn').click(function(){
        $('#step2_upload_MP4_input').click();
    });
    $('#step2_upload_PDF_btn').click(function(){
        $('#step2_upload_PDF_btninput').click();
    });
    $('#step2_upload_ZIP_btn').click(function(){
        $('#step2_upload_ZIP_input').click();
    });
    $('#step2_upload_HTML5_btn').click(function(){
        $('#step2_upload_HTML5_input').click();
    });
});

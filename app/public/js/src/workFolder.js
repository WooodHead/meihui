Vue.use(VueLazyload)
var index = new Vue({
    el: '.index',
    data(){
        return{
            aoData:{limit:12,offset:0,topicId:0},
            headDataList:[],
            uploadTotal:"",
            topicStatus:0,
            dataList:[],
            headInfo:{fullname:"",date:"",name:"",description:"",count:""},
            containerStyle:{
                minHeight:""
            },
            scrollModel:true,
            drawerShow:false
        }
    },
    methods:{
        checkThisTopic(id){
            window.location.href = config.viewUrl.workFolder.replace(":id",id);
        },
        uploadToTopic(id){
            window.location.href = config.viewUrl.uploadWork.replace(":id",id);
        },
        cockThisTopic(id, status){
            let that = this;
            let topicStatus = "";
            if (status == 1) {
                topicStatus = 0;
            } else {
                topicStatus = 1;
            }
            $.ajax({
                url: '/website/topics/'+id,
                type: 'PUT',
                data: {topicId: id,status:topicStatus},
                success(res){
                    if (res.status == 200) {
                        that.$Notice.success({
                            title:res.data,
                            duration:1,
                            onClose(){
                                $.ajax({
                                    url: config.ajaxUrls.getTopicAndArtifactById,
                                    type: 'GET',
                                    data: that.aoData,
                                    success:function(res){
                                        if (res.status == 200) {
                                            that.$Loading.finish();
                                            that.dataList = res.data.rows.artifacts;
                                            that.headDataList = res.data.rows.artifacts;
                                            that.uploadTotal = res.data.count;
                                            that.topicStatus = res.data.rows.status;

                                            that.headInfo.avatarUrl = res.data.rows.user.avatarUrl;
                                            that.headInfo.fullname = res.data.rows.user.fullname;
                                            that.headInfo.description = res.data.rows.description;
                                            that.headInfo.date = res.data.rows.createAt.split("T")[0] + " 发布";
                                            that.headInfo.name = res.data.rows.name;
                                            that.headInfo.Id = res.data.rows.userId;

                                            if (that.dataList.length == res.data.count) {
                                                that.scrollModel = false;
                                            }else{
                                                that.scrollModel = true;
                                            }
                                        }
                                    }
                                })
                            }
                        });
                    } else {
                        that.$Notice.error({title:res.data});
                    }
                }
            });
        },
        settingThisTopic(id){
            window.location.href = config.viewUrl.topicsUpdate.replace(":id",id);
        }
    },
    created(){
        this.screenWidth = document.documentElement.clientWidth;
        this.containerStyle.minHeight = document.documentElement.clientHeight - 150 + "px";
        this.aoData.topicId = window.location.href.split("workFolder/")[1];
        this.$Loading.start();
        let that = this;
        $.ajax({
            url: config.ajaxUrls.getTopicAndArtifactById,
            type: 'GET',
            data: this.aoData,
            success:function(res){
                if (res.status == 200) {
                    that.$Loading.finish();

                    that.dataList = res.data.rows.artifacts;
                    that.headDataList = res.data.rows.artifacts;
                    that.uploadTotal = res.data.count;
                    that.topicStatus = res.data.rows.status;

                    that.headInfo.avatarUrl = res.data.rows.user.avatarUrl;
                    that.headInfo.fullname = res.data.rows.user.fullname;
                    that.headInfo.description = res.data.rows.description;
                    that.headInfo.date = res.data.rows.createAt.split("T")[0] + " 发布";
                    that.headInfo.name = res.data.rows.name;
                    that.headInfo.Id = res.data.rows.userId;

                    if (that.dataList.length == res.data.count) {
                        that.scrollModel = false;
                    }else{
                        that.scrollModel = true;
                    }
                }
            }
        })
    }
})

$(document).ready(function() {
    $('html,body').animate({scrollTop:0});                          //每次刷新界面滚动条置顶
    $(window).scroll(function() {                                   //滚动加载数据
        if ($(document).scrollTop() >= $(document).height() - $(window).height() && index.scrollModel) {
            index.aoData.offset += 12;
            index.$Loading.start();
            $.ajax({
                url: config.ajaxUrls.getTopicAndArtifactById,
                type: 'GET',
                data: index.aoData,
                success:function(res){
                    if (res.status == 200) {
                        index.$Loading.finish();
                        index.dataList = index.dataList.concat(res.data.rows.artifacts);
                        if (index.dataList.length == res.data.count) {
                            index.scrollModel = false;
                        }else{
                            index.scrollModel = true;
                        }
                    }else{
                        index.$Loading.error();
                    }
                }
            })
        }
    })
});

'use strict'

const BaseController = require('../BaseController');
const Excel = require('exceljs');
const path = require('path');
const fs = require('fs');

class TopicsController extends BaseController{

  async index() {
    const ctx = this.ctx;
    const query = {
      limit: ctx.helper.parseInt(ctx.query.limit),
      offset: ctx.helper.parseInt(ctx.query.offset),
      jobTag: ctx.helper.parseInt(ctx.query.jobTag),
      subLimit: ctx.helper.parseInt(ctx.query.subLimit),
      status: ctx.helper.parseInt(ctx.query.status),
      userId: ctx.helper.parseInt(ctx.query.userId),
    };
    if (query.userId == 0 && ctx.user){
        query.userId = ctx.user.Id;
    }
    try{
      let result = await ctx.service.topics.list(query);
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
      const result = await ctx.service.topics.find(ctx.helper.parseInt(ctx.params.id));
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async create() {
    const ctx = this.ctx;
    let topic = ctx.request.body;
    topic.userId = ctx.user.Id;
    const result = await ctx.service.topics.create(topic);

    if(result){
      super.success(ctx.__('createdSuccess'));
    }
    else{
      super.failure(ctx.__('createdFailed'));
    }
  }

  async update() {
    const ctx = this.ctx;
    const id = ctx.params.id;
    const data = ctx.request.body;
    const updateData = {
        Id:id,
        updates:data
    };
     const result = await ctx.service.topics.update(updateData);
    if(result){
      super.success(ctx.__('updateSuccessful'));
    }
    else{
      super.failure(ctx.__('updateFailed'));
    }
  }

  async destroy() {
    const ctx = this.ctx;
    const id = ctx.helper.parseInt(ctx.params.id);
    const result = await ctx.service.topics.del(id);
    if(result){
        super.success(ctx.__('deletedSuccessful'));
    }
    else{
        super.failure(ctx.__('deletedFailed'));
    }

  }

  async getTopicAndArtifactById() {
    const ctx = this.ctx;
    const query = {
      limit: ctx.helper.parseInt(ctx.query.limit),
      offset: ctx.helper.parseInt(ctx.query.offset),
      topicId: ctx.helper.parseInt(ctx.query.topicId),
    };

    try{
      let result = await ctx.service.topics.getTopicAndArtifactById(query);
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async updateTopicStatus(){
     const ctx = this.ctx;
     const topicId = ctx.query.topicId;
     const status = ctx.query.status;

     try{
       await ctx.service.topics.updateTopicStatus(topicId,status);
       super.success(ctx.__('successfulOperation'));
     }
     catch(e){
       ctx.logger.error(e.message);
       super.failure(e.message);
     }
  }

  async findArtifactByTopicId() {
    const ctx = this.ctx;
    const topicId = ctx.helper.parseInt(ctx.query.topicId);

    try{
      let result = await ctx.service.topics.findArtifactByTopicId(topicId);
      ctx.body = result;
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async exportExcelByTopicId(){
    const ctx = this.ctx;
    const topicId = ctx.helper.parseInt(ctx.query.topicId);

    try{
      let topicObject = await ctx.service.topics.findArtifactByTopicId(topicId);
      let workbook = new Excel.Workbook();
      var worksheet = workbook.addWorksheet(topicObject.name);
      worksheet.columns = [
          { header: '作业名称', key: 'title', width: 60 },
          { header: '学生姓名', key: 'name', width: 20 },
          { header: '提交时间', key: 'createTime', width: 20 },
          { header: '得分', key: 'score', width: 20 },
      ];


      let filename = "没有可导出数据.xlsx";

      if(topicObject.length > 0){
        topicObject[0].artifacts.forEach((element,index)=>{
          let score = 0;
          if(element.artifact_scores.length > 0){
              score = element.artifact_scores[0].score;
          }
          worksheet.addRow({title: element.name, name: element.user.fullname, createTime: element.createAt, score:score});
        });
        filename = topicObject[0].name + ".xlsx";
      }
      ctx.attachment(filename);
      ctx.set('Content-Type','application/octet-stream');
      const filePath =  path.resolve(this.app.config.static.dir,'excel');

      if(!fs.existsSync(filePath)){
        fs.mkdirSync(filePath);
      }
      filename = path.resolve(filePath,filename);

      await workbook.xlsx.writeFile(filename);
      ctx.body = fs.createReadStream(filename);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }
}

module.exports = TopicsController;

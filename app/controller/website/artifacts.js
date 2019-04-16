'use strict'

const BaseController = require('../BaseController');

class ArtifactsController extends BaseController{

  async index() {
    const ctx = this.ctx;
    const query = {
      limit: ctx.helper.parseInt(ctx.query.limit),
      offset: ctx.helper.parseInt(ctx.query.offset),
      visible: ctx.helper.parseInt(ctx.query.visible),
      jobTag: ctx.helper.parseInt(ctx.query.jobTag),
    };

    try{
      const result = await ctx.service.artifacts.list(query);
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
      const result = await ctx.service.artifacts.find(ctx.helper.parseInt(ctx.params.id));
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async create() {
    const ctx = this.ctx;
    let artifact = ctx.request.body;
    artifact.userId = ctx.user.Id;
    let result = await ctx.service.artifacts.create(ctx.request.body);
    if(result){
      super.success(ctx.__('createdSuccess'));
    }
    else{
      super.failure(ctx.__('opFailedOrPodClosed'));
    }
  }

  async update() {
    const ctx = this.ctx;
    const id = ctx.params.id;
    const updates = ctx.request.body;
    let result = await ctx.service.artifacts.update({ id, updates });
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
    let result = await ctx.service.artifacts.del(id);
    if(result){
      super.success(ctx.__('deletedSuccessful'));
    }
    else{
      super.failure(ctx.__('deletedFailed'));
    }
  }

  async getMedalDataByRandom(){
    const ctx = this.ctx;
    const limit = ctx.params.limit;
    try{
      ctx.body = await ctx.service.artifacts.getMedalDataByRandom(limit);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async getPersonalJob() {
    const ctx = this.ctx;
    const query = {
      limit: ctx.helper.parseInt(ctx.query.limit),
      offset: ctx.helper.parseInt(ctx.query.offset),
      jobTag: ctx.helper.parseInt(ctx.query.jobTag),
    };
    query.userId = ctx.user.Id;
    try{
      const result = await ctx.service.artifacts.getPersonalJobByUserId(query);
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async getPersonalJobByUserId() {
    const ctx = this.ctx;
    const query = {
      limit: ctx.helper.parseInt(ctx.query.limit),
      offset: ctx.helper.parseInt(ctx.query.offset),
      userId: ctx.helper.parseInt(ctx.query.userId),
      jobTag: ctx.helper.parseInt(ctx.query.jobTag),
    };

    try{
      const result = await ctx.service.artifacts.getPersonalJobByUserId(query);
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async transterInsertDataToES(){
    const ctx = this.ctx;
    const ids = ctx.query.ids;

    const idArray = ids.split(',');
    if (idArray.length > 0){
        let result = await ctx.service.artifacts.transterInsertDataToES(idArray);
        if (result){
            super.success(ctx.__('synchronousSuccess'));
        }
        else{
            super.failure(ctx.__('synchronousFailed'));
        }
    }
    else{
        super.failure(ctx.__('noDataNeedToSync'));
    }

  }

  async transterUpdateDataToES(){
    const ctx = this.ctx;
    const ids = ctx.query.ids;

    const idArray = ids.split(',');
    if (idArray.length > 0){
        let result = await ctx.service.artifacts.transterUpdateDataToES(idArray);
        if (result){
            super.success(ctx.__('synchronousSuccess'));
        }
        else{
            super.failure(ctx.__('synchronousFailed'));
        }
    }
    else{
        super.failure(ctx.__('noDataNeedToSync'));
    }
  }
}

module.exports = ArtifactsController;

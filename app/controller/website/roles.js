'use strict'

const BaseController = require('../BaseController');

class RolesController extends BaseController{

  async index() {
    const ctx = this.ctx;
    const query = {
      limit: ctx.helper.parseInt(ctx.query.limit),
      offset: ctx.helper.parseInt(ctx.query.offset),
    };

    try{
      const result = await ctx.service.roles.list(query);
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
      const result = await ctx.service.roles.find(ctx.helper.parseInt(ctx.params.id));
      super.success(result);
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

  async create() {
    const ctx = this.ctx;
    try{
      const role = await ctx.service.roles.create(ctx.request.body);
      super.success(ctx.__('createdSuccessful'));
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
      name: ctx.request.body.name,
    };

    try{
      await ctx.service.roles.update({ id, updates });
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
      await ctx.service.roles.del(id);
      super.success(ctx.__('deletedSuccessful'));
    }
    catch(e){
      ctx.logger.error(e.message);
      super.failure(e.message);
    }
  }

}

module.exports = RolesController;

'use strict'

const BaseController = require('../BaseController');

class ArtifactMedalLikeController extends BaseController{

  async create() {
    const ctx = this.ctx;
    let tag = 0;
    if(ctx.user.roles[0].name == 'vip' || ctx.user.roles[0].name == 'admin'){
      tag = 1;
    }
    else if (ctx.user.roles[0].name == 'user'){
      tag = 2;
    }
    let data = {
      tag:tag,
      userId:ctx.user.Id,
      artifactId:ctx.request.body.artifactId,
      artifactUserId:ctx.request.body.artifactUserId,
    };

    const result = await ctx.service.artifactMedalLike.create(data);

    if(result){
      super.success(ctx.__('successfulOperation'));
    }
    else{
      super.failure(ctx.__('failedOperation'));
    }
  }

  async getMedalLikeDataByUserIdAndArtifactsId(){
      const ctx = this.ctx;
      let tag = 0;
      if(ctx.user.roles[0].name == 'vip' || ctx.user.roles[0].name == 'admin'){
        tag = 1;
      }
      else if (ctx.user.roles[0].name == 'user'){
        tag = 2;
      }

      let artifactMedalLike = {
          tag:tag,
          userId:ctx.user.Id,
          artifactId:ctx.query.artifactId
      }

      const result = await ctx.service.artifactMedalLike.getMedalLikeDataByUserIdAndArtifactsId(artifactMedalLike);
      if(result){
        super.success(ctx.__('hasLiked'));
      }
      else{
        super.failure(ctx.__('notLiked'));
      }
  }
}

module.exports = ArtifactMedalLikeController;

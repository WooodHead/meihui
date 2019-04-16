'use strict';

const Service = require('egg').Service;
const path = require('path');

class ArtifactComment extends Service {

  async list({ offset = 0, limit = 10}) {
    let resultObj = await this.ctx.model.ArtifactComments.listComments({
      offset,
      limit,
    });
    return resultObj;
  }

  async findByArtifactIdWithPage({ offset = 0, limit = 10, artifactId = 0}) {
    let resultObj = await this.ctx.model.ArtifactComments.findByArtifactIdWithPage({
      offset,
      limit,
      artifactId,
    });

    const helper = this.ctx.helper;
    resultObj.rows.forEach((element, index)=>{
      if(element.user.avatarUrl){
        element.user.avatarUrl = helper.baseUrl + path.join(helper.othersPath, (element.user.Id).toString(), element.user.avatarUrl);
      }
    });

    return resultObj;
  }

  async findCommentById(id) {
    return await this.ctx.model.ArtifactComments.findCommentById(id);
  }

  async create(artifactComments) {
    let transaction;
    try {
      transaction = await this.ctx.model.transaction();
      artifactComments.visible = 0;
      await this.ctx.model.ArtifactComments.createComment(artifactComments, transaction);
      await this.ctx.model.Artifacts.addComment(artifactComments.artifactId, transaction);
      await this.ctx.model.Users.addComment(artifactComments.commenterId, transaction);
      await transaction.commit();
      return true
    } catch (e) {
      await transaction.rollback();
      this.ctx.logger.error(e.message);
      return false
    }

  }

  async update({Id = 0, visible = 0}) {
    const artifact = await this.ctx.model.ArtifactComments.setVisible(Id);
    return artifact;
  }

  async del(Id) {
    let transaction;
    try {
      transaction = await this.ctx.model.transaction();
      const comment = await this.ctx.model.ArtifactComments.findCommentById(Id);
      await this.ctx.model.ArtifactComments.delCommentById(Id, transaction);
      await this.ctx.model.Artifacts.reduceComment(comment.artifactId, transaction);
      await this.ctx.model.Users.reduceComment(comment.commenterId, 1, transaction);
      await transaction.commit();
      return true
    } catch (e) {
      await transaction.rollback();
      this.ctx.logger.error(e.message);
      return false
    }

    return artifact;
  }

  async searchByKeyword({ offset = 0, limit = 10, keyword = '', field = 1}){
    let condition = {
      offset:offset,
      limit:limit,
      keyword:keyword
    };
    let result;
    if (field == 1){
      result = await this.ctx.model.ArtifactComments.searchCommentByContent(condition)
    }
    else if (field == 2){
      result = await this.ctx.model.ArtifactComments.searchCommentByUsername(condition);
    }
    else if (field == 3){
      result = await this.ctx.model.ArtifactComments.searchCommentByArtifactsName(condition);
    }
    return result;
  }
}

module.exports = ArtifactComment;

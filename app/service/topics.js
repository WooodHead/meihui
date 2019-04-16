'use strict';

const Service = require('egg').Service;
const path = require('path');

class Topics extends Service {

  async list({ offset = 0, limit = 10,jobTag = 0, subLimit = 10, status = 0,userId=0 }) {
    let resultObj = await this.ctx.model.Topics.listTopics({
      offset,
      limit,
      jobTag,
      subLimit,
      status,
      userId,
    });

    const helper = this.ctx.helper;
    resultObj.rows.forEach((element, index)=>{
      if(element.user.avatarUrl){
        element.user.avatarUrl = helper.baseUrl + path.join(helper.othersPath, (element.user.Id).toString(), element.user.avatarUrl);
      }

      for (let subElement of element.artifacts){
        subElement.profileImage = helper.baseUrl + path.join(helper.imagePath, (subElement.userId).toString(), subElement.profileImage);
      }
    });

    return resultObj;
  }

  async searchTopics({ offset = 0, limit = 10,jobTag = 0, subLimit = 10, status = 0,userId=0,keyword='' }) {
    let resultObj = await this.ctx.model.Topics.searchTopics({
      offset,
      limit,
      jobTag,
      subLimit,
      status,
      userId,
      keyword,
    });

    const helper = this.ctx.helper;
    resultObj.rows.forEach((element, index)=>{
      if(element.user.avatarUrl){
        element.user.avatarUrl = helper.baseUrl + path.join(helper.othersPath, (element.user.Id).toString(), element.user.avatarUrl);
      }
      for (let subElement of element.artifacts){
        subElement.profileImage = helper.baseUrl + path.join(helper.imagePath, (subElement.userId).toString(), subElement.profileImage);
      }
    });

    return resultObj;
  }


  async find(Id) {
    const topic = await this.ctx.model.Topics.findTopicById(Id);
    return topic;
  }

  async create(topic) {
    let transaction;
    try {
      transaction = await this.ctx.model.transaction();
      const topicObj = await this.ctx.model.Topics.createTopic(topic,transaction);
      let terms = topic.terms;
      for (let term of terms){
        const termObj = await this.ctx.model.Terms.createTerm(term,transaction);
        await this.ctx.model.TopicTerm.createTopicTerm({
          topicId:topicObj.Id,
          termId:termObj.Id
        },transaction);
      }
      await transaction.commit();
      return true
    } catch (e) {
      this.ctx.logger.error(e.message);
      await transaction.rollback();
      return false
    }
  }

  async update({ Id, updates }) {

    let transaction;
    try {
      transaction = await this.ctx.model.transaction();
      updates.updateAt = new Date();
      let updateObject = await this.ctx.model.Topics.updateTopic({ Id, updates },transaction);

      if (updates.addTerms && updates.addTerms.length > 0){
        for (let term of updates.addTerms){
          const termObj = await this.ctx.model.Terms.createTerm(term,transaction);
          await this.ctx.model.TopicTerm.createTopicTerm({
            topicId:topicObj.Id,
            termId:termObj.Id
          },transaction);
        }
      }

      if (updates.deleteTerms && updates.deleteTerms.length > 0){
        await this.ctx.model.TopicTerm.delTopicTermByTopicIdAndtermIds(id,updates.deleteTerms,transaction);
      }
      await transaction.commit();

      return true
    } catch (e) {
      this.ctx.logger.error(e.message);
      await transaction.rollback();
      return false
    }
  }

  async del(id) {
    let transaction;
    try {
      transaction = await this.ctx.model.transaction();
      await this.ctx.model.Topics.delTopicById(id,transaction);
      await this.ctx.model.TopicTerm.delTopicTermByTopicId(id,transaction);
      await transaction.commit();
      return true
    } catch (e) {
      await transaction.rollback();
      return false
    }
  }

  async getTopicAndArtifactById({ offset = 0, limit = 10, topicId = 0 }) {
    const topic = await this.ctx.model.Topics.getTopicAndArtifactById({
      offset,
      limit,
      topicId
    });

    const helper = this.ctx.helper;
    if(topic.rows.user.avatarUrl){
      topic.rows.user.avatarUrl = helper.baseUrl + path.join(helper.othersPath, (topic.rows.user.Id).toString(), topic.rows.user.avatarUrl);
    }

    topic.rows.artifacts.forEach((element, index)=>{
      element.profileImage = helper.baseUrl + path.join(helper.imagePath, (element.user.Id).toString(), element.profileImage);
      element.user.avatarUrl = helper.baseUrl + path.join(helper.othersPath, (element.user.Id).toString(), element.user.avatarUrl);
    });

    return topic;
  }

  async updateTopicStatus(topicId,status){
    return await this.ctx.model.Topics.updateTopicStatus(topicId,status);
  }

  async findArtifactByTopicId(topicId){
    return await this.ctx.model.Topics.findArtifactByTopicId(topicId);
  }
}

module.exports = Topics;

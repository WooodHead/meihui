'use strict';

const Service = require('egg').Service;
const path = require('path');
const fs = require('fs');

class Artifacts extends Service {

  async list({ offset = 0, limit = 10, visible = 0, jobTag = 0}) {

    let resultObj = await this.ctx.model.Artifacts.listArtifacts({
      offset,
      limit,
      visible,
      jobTag,
    });

    const helper = this.ctx.helper;
    resultObj.rows.forEach((element, index)=>{

      element.profileImage = helper.baseUrl + path.join(helper.imagePath, (element.userId).toString(), element.profileImage);

      for (let subElement of element.artifact_assets){
        subElement.profileImage = helper.baseUrl + path.join(helper.imagePath, (element.userId).toString(), subElement.profileImage);

        if (subElement.type == 2 && subElement.mediaFile != null){
            subElement.mediaFile = helper.baseUrl + path.join(helper.pdfPath, (element.userId).toString(), subElement.mediaFile);
        }
        else if (subElement.type == 3 && subElement.mediaFile != null){
          subElement.mediaFile = helper.baseUrl + path.join(helper.rar_zipPath, (element.userId).toString(), subElement.mediaFile);
        }
        else if (subElement.type == 4 && subElement.mediaFile != null){
          subElement.mediaFile = helper.baseUrl + path.join(helper.videoPath, (element.userId).toString(), subElement.mediaFile);
        }
      }
    });

    return resultObj;
  }

  async find(id) {

    const artifact = await this.ctx.model.Artifacts.findArtifactById(id);
    const helper = this.ctx.helper;

    artifact.profileImage = helper.baseUrl + path.join(helper.imagePath, (artifact.userId).toString(), artifact.profileImage);

    if(artifact.user.avatarUrl){
      artifact.user.avatarUrl = helper.baseUrl + path.join(helper.othersPath, (artifact.user.Id).toString(), artifact.user.avatarUrl);
    }

    for (let subElement of artifact.artifact_assets){

      subElement.profileImage = helper.baseUrl + path.join(helper.imagePath, (artifact.userId).toString(), subElement.profileImage);

      if (subElement.type == 2 && subElement.mediaFile != null){
          subElement.mediaFile = helper.baseUrl + path.join(helper.pdfPath, (artifact.userId).toString(), subElement.mediaFile);
      }
      else if (subElement.type == 3 && subElement.mediaFile != null){
        subElement.mediaFile = helper.baseUrl + path.join(helper.rar_zipPath, (artifact.userId).toString(), subElement.mediaFile);
      }
      else if (subElement.type == 4 && subElement.mediaFile != null){
        subElement.mediaFile = helper.baseUrl + path.join(helper.videoPath, (artifact.userId).toString(), subElement.mediaFile);
      }
    }

    return artifact;
  }

  async create(artifact) {
    if (artifact.topicId == 0 && artifact.jobTag == 2){ //作品集上传
      let transaction;
      try {
        transaction = await this.ctx.model.transaction();
        artifact.visible = 0;
        const artiObj = await this.ctx.model.Artifacts.createArtifact(artifact,transaction);

        let terms = artifact.terms;
        if (terms){
          for (let term of terms){
            const termObj = await this.ctx.model.Terms.createTerm(term,transaction);
            await this.ctx.model.ArtifactTerm.createArtifactTerm({
              artifactId:artiObj.Id,
              termId:termObj.Id
            },transaction);
          }
        }

        await this.ctx.model.Users.addArtifact(artifact.userId,transaction);
        await transaction.commit();

        return true
      } catch (e) {
        await transaction.rollback();
        this.ctx.logger.error(e.message);
        return false
      }
    }
    else {
      //作业夹上传
      const topic = await this.ctx.model.Topics.findTopicById(artifact.topicId);
      if(topic){
        if(topic.status == 0)
        {
          let transaction;
          try {
            transaction = await this.ctx.model.transaction();
            artifact.visible = 0;
            const artiObj = await this.ctx.model.Artifacts.createArtifact(artifact,transaction);
            if (artifact.topicId != 0){
                await this.ctx.model.TopicArtifact.createTopicArtifact(
                    {
                      artifactId:artiObj.Id,
                      topicId:artifact.topicId
                    },transaction);
            }

            let terms = artifact.terms;
            if(terms){
              for (let term of terms){
                const termObj = await this.ctx.model.Terms.createTerm(term,transaction);
                await this.ctx.model.ArtifactTerm.createArtifactTerm({
                  artifactId:artiObj.Id,
                  termId:termObj.Id
                },transaction);
              }
            }

            await this.ctx.model.Users.addArtifact(artifact.userId,transaction);
            await transaction.commit();

            return true
          } catch (e) {
            await transaction.rollback();
            this.ctx.logger.error(e.message);
            return false
          }
        }
        else if(topic.status == 1){
          return false;
        }

      }
      else{
        return false;
      }
    }

  }

  async update({ id, updates }) {
    const ctx = this.ctx;
    let transaction;
    try {
      transaction = await ctx.model.transaction();
      updates.updateAt = new Date();

      const artifact = await ctx.model.Artifacts.findArtifactById(id);

      let updateObject = await ctx.model.Artifacts.updateArtifact({ id, updates },transaction);

      if (updates.artifact_assets && updates.artifact_assets.length > 0){
        await ctx.model.ArtifactAssets.delAssetsByArtifactId(id,transaction);
        for (let artifact_asset of updates.artifact_assets){
            const asset = {};
            asset.position = artifact_asset.position,
            asset.name = artifact_asset.name,
            asset.filename = artifact_asset.filename,
            asset.description = artifact_asset.description,
            asset.type = artifact_asset.type,
            asset.profileImage = artifact_asset.profileImage,
            asset.imagename = artifact_asset.imagename,
            asset.mediaFile = artifact_asset.mediaFile,
            asset.viewUrl = artifact_asset.viewUrl,
            asset.artifactId = id;
            await ctx.model.ArtifactAssets.createAssets(asset,transaction);
        }
      }

      if (updates.addTerms && updates.addTerms.length > 0){
        for (let term of updates.addTerms){
          const termObj = await ctx.model.Terms.createTerm(term,transaction);
          await ctx.model.ArtifactTerm.createArtifactTerm({
            artifactId:artifact.Id,
            termId:termObj.Id
          },transaction);
        }
      }

      if (updates.deleteTerms && updates.deleteTerms.length > 0){
        await ctx.model.ArtifactTerm.delArtifactTermByArtifactIdAndtermId(id,updates.deleteTerms,transaction);
      }
      await transaction.commit();

      try{
        let artiObj = await this.ctx.model.Artifacts.transterDataToESById(id);
        if (artiObj){
          await ctx.service.esUtils.updateobject(artiObj.Id, artiObj);
          let object = {};
          object.Id = artiObj.Id;
          object.suggest = new Array();

          let name_suggest = {};
          name_suggest.input = artiObj.name;
          name_suggest.weight = 10;
          object.suggest.push(name_suggest);

          let fullname_suggest = {};
          fullname_suggest.input = artiObj.user.fullname;
          fullname_suggest.weight = 16;
          object.suggest.push(fullname_suggest);

          artiObj.terms.forEach((term,index)=>{
            let term_suggest = {};
            term_suggest.input = term.name;
            term_suggest.weight = 8;
            object.suggest.push(term_suggest);
          });
          await ctx.service.esUtils.updateSuggestObject(artiObj.Id, artiObj);
        }
      }
      catch(e){
        ctx.getLogger('elasticLogger').error("update ID:"+id+": "+e.message+"\n");
      }

      let deleteFileArray = new Array();
      try{

        if(artifact.profileImage != updates.profileImage){
          deleteFileArray.push(path.join(helper.basePath, helper.imagePath, (element.userId).toString(), artifact.profileImage));
        }

        for (const artifactAssets of artifact.dataValues.artifact_assets){
          if(ctx.helper.judgeImageStringInArrayObject(artifactAssets.profileImage,updates.artifact_assets)){
            deleteFileArray.push(path.join(helper.basePath, helper.imagePath, (element.userId).toString(), artifactAssets.profileImage));
          }

          if(artifactAssets.type == 2){
            if(ctx.helper.judgeMediaStringInArrayObject(artifactAssets.mediaFile,updates.artifact_assets)){
              deleteFileArray.push(path.join(helper.basePath, helper.pdfPath, (element.userId).toString(), artifactAssets.mediaFile));
            }
          }
          else if(artifactAssets.type == 3){
            if(ctx.helper.judgeMediaStringInArrayObject(artifactAssets.mediaFile,updates.artifact_assets)){
              deleteFileArray.push(path.join(helper.basePath, helper.rar_zipPath, (element.userId).toString(), artifactAssets.mediaFile));
            }
          }
          else if(artifactAssets.type == 4){
            if(ctx.helper.judgeMediaStringInArrayObject(artifactAssets.mediaFile,updates.artifact_assets)){
              deleteFileArray.push(path.join(helper.basePath, helper.videoPath, (element.userId).toString(), artifactAssets.mediaFile));
            }
          }
        }

        if (deleteFileArray.length > 0){
          for (let path of deleteFileArray){
              if (fs.existsSync(path)){
                fs.unlinkSync(path);
              }
          }
        }
      }
      catch(e){
          ctx.getLogger('fileLogger').error("delete file:"+deleteFileArray.join(',')+": "+e.message+"\n");
      }

      return true
    } catch (e) {
      await transaction.rollback();
      ctx.logger.error(e.message);
      return false
    }
  }

  async del(id) {
    const ctx = this.ctx;
    let transaction;
    try {
      transaction = await ctx.model.transaction();
      const artifact = await ctx.model.Artifacts.findArtifactById(id);
      await ctx.model.Artifacts.delArtifactById(id, transaction);
      await ctx.model.ArtifactAssets.delAssetsByArtifactId(id, transaction);
      await ctx.model.ArtifactComments.delCommentByArtifactId(id, transaction);
      await ctx.model.ArtifactTerm.delArtifactTermByArtifactId(id, transaction);
      await ctx.model.Users.reduceAllAggData(artifact.userId, artifact.medalCount, artifact.likeCount, artifact.commentCount, transaction);

      try{
        await ctx.service.esUtils.deleteObjectById(id);
        await ctx.service.esUtils.deleteSuggestObjectById(id);
      }
      catch(e){
        ctx.getLogger('elasticLogger').info("delete ID:"+id+": "+e.message+"\n");
      }

      let deleteFileArray = new Array();
      try{
        if(artifact.profileImage != updates.profileImage){
          deleteFileArray.push(path.join(helper.basePath, helper.imagePath, (element.userId).toString(), artifact.profileImage));
        }

        for (const artifactAssets of artifact.dataValues.artifact_assets){
          if(ctx.helper.judgeImageStringInArrayObject(artifactAssets.profileImage,updates.artifact_assets)){
            deleteFileArray.push(path.join(helper.basePath, helper.imagePath, (element.userId).toString(), artifactAssets.profileImage));
          }

          if(artifactAssets.type == 2){
            if(ctx.helper.judgeMediaStringInArrayObject(artifactAssets.mediaFile,updates.artifact_assets)){
              deleteFileArray.push(path.join(helper.basePath, helper.pdfPath, (element.userId).toString(), artifactAssets.mediaFile));
            }
          }
          else if(artifactAssets.type == 3){
            if(ctx.helper.judgeMediaStringInArrayObject(artifactAssets.mediaFile,updates.artifact_assets)){
              deleteFileArray.push(path.join(helper.basePath, helper.rar_zipPath, (element.userId).toString(), artifactAssets.mediaFile));
            }
          }
          else if(artifactAssets.type == 4){
            if(ctx.helper.judgeMediaStringInArrayObject(artifactAssets.mediaFile,updates.artifact_assets)){
              deleteFileArray.push(path.join(helper.basePath, helper.videoPath, (element.userId).toString(), artifactAssets.mediaFile));
            }
          }
        }

        if (deleteFileArray.length > 0){
          for (let path of deleteFileArray){
              if (fs.existsSync(path)){
                fs.unlinkSync(path);
              }
          }
        }

      }
      catch(e){
          ctx.getLogger('aliossLogger').error("delete ID:"+deleteFileArray.join(',')+": "+e.message+"\n");
      }
      await transaction.commit();
      return true
    } catch (e) {
      await transaction.rollback();
      ctx.logger.error(e.message);
      return false
    }
  }

  async getMedalDataByRandom(limit){
    const helper = this.ctx.helper;
    const listData = await this.ctx.model.Artifacts.getMedalDataByRandom();
    const max = listData.length;
    if(max < limit){
        listData.forEach((element, index)=>{
            if(element.user.avatarUrl){
              element.user.avatarUrl = helper.baseUrl + path.join(helper.othersPath, (element.user.Id).toString(), element.user.avatarUrl);
            }
            let profileImage = element.profileImage;
            element.profileImage = helper.baseUrl + path.join(helper.imagePath, (element.userId).toString(), element.profileImage);
        });

        return listData;
    }
    else{
      const setData = new Set();
      while(setData.size != limit){
        let rand = Math.random();
        let num = Math.floor(rand * max);
        setData.add(num);
      }
      let result = new Array();
      for (let item of setData.values()) {
        let profileImage = listData[item].dataValues.profileImage;
        listData[item].dataValues.profileImage = helper.baseUrl + path.join(helper.imagePath, (listData[item].dataValues.userId).toString(), profileImage);
        if(listData[item].dataValues.user.avatarUrl){
          listData[item].dataValues.user.avatarUrl = helper.baseUrl + path.join(helper.othersPath, (listData[item].dataValues.user.Id).toString(), listData[item].dataValues.user.avatarUrl);
        }
        result.push(listData[item]);
      }

      return result;
    }
  }

  async getPersonalJobByUserId(query) {
    let resultObj = await this.ctx.model.Artifacts.getPersonalJobByUserId(query);
    const helper = this.ctx.helper;
    resultObj.rows.forEach((element, index)=>{

      if(element.user.avatarUrl){
        element.user.avatarUrl = helper.baseUrl + path.join(helper.othersPath, (element.user.Id).toString(), element.user.avatarUrl);
      }

      element.profileImage = helper.baseUrl + path.join(helper.imagePath, (element.userId).toString(), element.profileImage);

      for (let subElement of element.artifact_assets){
        subElement.profileImage = helper.baseUrl + path.join(helper.imagePath, (element.userId).toString(), subElement.profileImage);

        if (subElement.type == 2 && subElement.mediaFile != null){
            subElement.mediaFile = helper.baseUrl + path.join(helper.pdfPath, (element.userId).toString(), subElement.mediaFile);
        }
        else if (subElement.type == 3 && subElement.mediaFile != null){
          subElement.mediaFile = helper.baseUrl + path.join(helper.rar_zipPath, (element.userId).toString(), subElement.mediaFile);
        }
        else if (subElement.type == 4 && subElement.mediaFile != null){
          subElement.mediaFile = helper.baseUrl + path.join(helper.videoPath, (element.userId).toString(), subElement.mediaFile);
        }
      }

    });
    return resultObj;
  }

  async transferArtifacts() {
    let data = await this.ctx.model.Artifacts.transferArtifacts();

    return data;
  }

  async transterInsertDataToES(idArray) {
    const ctx = this.ctx;
    try{
      let esArray = await this.ctx.model.Artifacts.transferArtifacts(idArray);
      for (let artiObj of esArray){
        await ctx.service.esUtils.createObject(artiObj.Id, artiObj);

        let object = {};
        object.Id = artiObj.Id;
        object.suggest = new Array();

        let name_suggest = {};
        name_suggest.input = artiObj.name;
        name_suggest.weight = 10;
        object.suggest.push(name_suggest);

        let fullname_suggest = {};
        fullname_suggest.input = artiObj.user.fullname;
        fullname_suggest.weight = 16;
        object.suggest.push(fullname_suggest);

        artiObj.terms.forEach((term,index)=>{
          let term_suggest = {};
          term_suggest.input = term.name;
          term_suggest.weight = 8;
          object.suggest.push(term_suggest);
        });
        await ctx.service.esUtils.createSuggestObject(artiObj.Id, object);
      }
      return true;
    }
    catch(e){
      ctx.logger.error(e.message);
      return false;
    }
  }

  async transterUpdateDataToES(idArray) {
    const ctx = this.ctx;
    try{
      let esArray = await this.ctx.model.Artifacts.transferArtifacts(idArray);
      for (let artiObj of esArray){
        await ctx.service.esUtils.updateobject(artiObj.Id, artiObj);
        let object = {};
        object.Id = artiObj.Id;
        object.suggest = new Array();

        let name_suggest = {};
        name_suggest.input = artiObj.name;
        name_suggest.weight = 10;
        object.suggest.push(name_suggest);

        let fullname_suggest = {};
        fullname_suggest.input = artiObj.user.fullname;
        fullname_suggest.weight = 16;
        object.suggest.push(fullname_suggest);

        artiObj.terms.forEach((term,index)=>{
          let term_suggest = {};
          term_suggest.input = term.name;
          term_suggest.weight = 8;
          object.suggest.push(term_suggest);
        });
        await ctx.service.esUtils.updateSuggestObject(artiObj.Id, artiObj);
      }
      return true;
    }
    catch(e){
      ctx.logger.error(e.message);
      return false;
    }
  }
}

module.exports = Artifacts;

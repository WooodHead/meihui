module.exports = () => {
  return async (ctx, next) => {
    if (ctx.isAuthenticated() ){

        if(ctx.user.roles && ctx.user.roles.length > 0){
          if (ctx.user.roles[0].name == 'vip'){
            await  next();
          }
          else{
            ctx.body = {
              success: true,
              status:999,
              data:ctx.__('noAuthNoDO'),
            };
          }
        }
        else{
          ctx.body = {
            success: true,
            status:999,
            data:ctx.__('noAuthNoDO'),
          };
        }
      }
      else{
        ctx.body = {
          success: true,
          status:999,
          data:ctx__('noAuthAndLogin'),
        };
      }

  }
};

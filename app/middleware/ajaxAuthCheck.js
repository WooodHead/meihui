module.exports = () => {
  return async (ctx, next) => {
    if (ctx.isAuthenticated()) {
      await next();
    } else {
      ctx.body = {
        success: true,
        status: 999,
        data: ctx__('noAuthAndLogin'),
      };
    }

  }
};

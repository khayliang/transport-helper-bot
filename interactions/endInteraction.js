module.exports.endInteraction = async (ctx) => {
  // end method
  // function to handle end of interaction
  // if interaction ends, clear data, reset step, reset route
  ctx.session.route = 'start';
  ctx.session.data = {};
  ctx.session.step = 'idle';
};

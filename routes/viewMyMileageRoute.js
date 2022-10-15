module.exports.viewMyMileageRoute = async (ctx) => {
  const { totalMileage } = ctx.session.user;
  await ctx.reply(`Your current mileage is: ${totalMileage}`);
  ctx.session.route = 'start';
};

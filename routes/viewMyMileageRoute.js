module.exports.viewMyMileageRoute = async (ctx) => {
  const { total_mileage } = ctx.session.user;
  await ctx.reply(`Your current mileage is: ${total_mileage}`);
  ctx.session.route = "start";
};

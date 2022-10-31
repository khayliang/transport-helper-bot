module.exports.viewMyMileageRoute = async (ctx) => {
  try{
    const { totalMileage } = ctx.session.user;
    await ctx.reply(`Your current mileage is: ${totalMileage}`);
    ctx.session.route = 'start';
  } catch(err){
    await ctx.reply(`Error: ${err.message}`)
    ctx.session.route = 'start';  
  }

};

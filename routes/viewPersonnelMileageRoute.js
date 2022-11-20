const { getUsersInUnit } = require('../api/getUsersInUnit');
const { nodesEnum } = require('../enums/nodesEnum');

module.exports.viewPersonnelMileageRoute = async (ctx) => {
  const { armyUnit } = ctx.session.user;
  try {
    const users = await getUsersInUnit({ armyUnit });
    users.sort((a,b) => b.totalMileage - a.totalMileage)
    let msg = `Mileage for ${nodesEnum[armyUnit]}:\n`;
    users.forEach(({ name, totalMileage }) => {
      msg += `${name}: ${totalMileage}\n`;
    });
    await ctx.reply(msg);
    ctx.session.route = 'start';
  } catch (err) {
    await ctx.reply(err.message);
  }
};

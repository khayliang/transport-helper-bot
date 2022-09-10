const { getUsersInUnit } = require("../api/getUsersInUnit");
const { nodesEnum } = require("../enums/nodesEnum");

module.exports.viewPersonnelMileageRoute = async (ctx) => {
  const { army_unit } = ctx.session.user;
  const users = await getUsersInUnit({ army_unit });
  let msg = `Mileage for ${nodesEnum[army_unit]}:\n`;
  users.forEach(({ name, total_mileage }, idx) => {
    msg += `${name}: ${total_mileage}\n`;
  });
  await ctx.reply(msg);
  ctx.session.route = "start";
};

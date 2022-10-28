const { getWptListForNode } = require('../api/getWptListForNode');

module.exports.viewMyWptListRoute = async (ctx) => {
  try {
    const { armyUnit } = ctx.session.user;
    const resp = await getWptListForNode({ node: armyUnit });
    const { unregistered, node } = resp;
    let msg = '';
    msg += `WPT for ${armyUnit} Node\n`;
    msg += 'WPT 1: \n';
    node.wpt1.forEach(({ vehicleNo }) => {
      msg += `${vehicleNo}\n`;
    });
    msg += 'WPT 2:\n';
    node.wpt2.forEach(({ vehicleNo }) => {
      msg += `${vehicleNo}\n`;
    });

    msg += '\nWPT for unregistered vehicles\n';
    msg += 'WPT 1: \n';
    unregistered.wpt1.forEach(({ vehicleNo }) => {
      msg += `${vehicleNo}\n`;
    });
    msg += 'WPT 2:\n';
    unregistered.wpt2.forEach(({ vehicleNo }) => {
      msg += `${vehicleNo}\n`;
    });
    await ctx.reply(msg);
  } catch (err) {
    await ctx.reply(err.message);
  }
  ctx.session.route = 'start';
};

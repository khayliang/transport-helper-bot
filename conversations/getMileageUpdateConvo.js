const { addMileageUpdateRoute } = require('../routes/addMileageUpdateRoute');
const { getMessageData } = require('../utils/getMessageData');
const { parseMileageUpdate } = require('../utils/parseMileageUpdate');

module.exports.getMileageUpdateConvo = async (conversation, ctx) => {
  try {
    await ctx.reply('Send me your mileage update message');
    const newCtx = await conversation.wait();
    const data = await getMessageData(newCtx);
    const {
      vehicleNo, initialTimestamp, initialMileage, finalMileage,
    } = parseMileageUpdate(data);
    newCtx.session.data = {
      vehicleNo,
      timestamp: initialTimestamp,
      initialMileage,
      finalMileage,
      vehicleClass: null,
      activityType: null,
    };
    newCtx.session.step = 'endconvo';
    await addMileageUpdateRoute(newCtx);
  } catch (err) {
    await ctx.reply(err.message);
  }
};

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
    await ctx.reply('Ensure that your message is in the following format and sequence\n\n'
    + 'Rank / Name: LCP TAN WEI JIE\n'
    + 'Mask NRIC: TXXXX123A\n'
    + 'Purpose: detail\n'
    + 'Vehicle No: 12345\n'
    + 'IVC working: Yes\n'
    + 'Starting destination: Bedok Camp\n'
    + 'Date/Time start: 181122/0415\n'
    + 'Start Odo: 12345\n'
    + 'End destination: Bedok Camp\n'
    + 'Date/Time end: 181122/1635\n'
    + 'End Odo: 12350\n'
    + 'Pol Amt: nil\n'
    + 'Pol Odo: nil', { parse_mode: 'HTML' });
    throw Error(err.message);
  }
};

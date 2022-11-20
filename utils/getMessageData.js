// get message data for either button or text response
module.exports.getMessageData = async (ctx) => {
  let msg = '';
  try {
    if (!ctx.callbackQuery) {
      msg = ctx.message.text;
    } else {
      msg = ctx.callbackQuery.data;
    }
  } catch (err) {
    await ctx.reply(`Invalid message${err.message}`);
    throw Error(err.message);
  }
  return msg;
};

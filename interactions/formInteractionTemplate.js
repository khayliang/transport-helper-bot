const { InlineKeyboard } = require("grammy");
const _ = require("lodash");
const { endInteraction } = require("./endInteraction");

const sendPrompt = async (ctx, formData) => {
  const { entries } = formData;
  const { type: typeOfPrompt, buttons, prompt } = entries[ctx.session.step];
  if (typeOfPrompt === "buttons") {
    await ctx.reply(prompt(), { reply_markup: buttons() });
  } else {
    await ctx.reply(prompt());
  }
};

module.exports.formInteractionTemplate = async (ctx, formData) => {
  const { entries } = formData;
  // run this if the form hasn't been initialized
  if (ctx.session.step === "idle") {
    ctx.session.step = 0;
    const { onStart } = formData;
    if (onStart) await onStart(ctx);
    await sendPrompt(ctx, formData);
    return;
  }
  // run this to process response if it is on the verification step
  else if (ctx.session.step === "verify") {
    let msg = ctx.callbackQuery.data;
    if (msg === "submit") {
      const { onFinish } = formData;
      const finalResponses = ctx.session.data;

      if (onFinish) await onFinish(ctx, finalResponses);
      await endInteraction(ctx);
      return;
    } else {
      try {
        //check to see if response for verification is an idx
        const idx = _.toNumber(msg);
        if (!entries[idx]) {
          throw Error(
            "That doesn't seem to be something you can edit. Choose a valid entry"
          );
        }
        const dataKey = entries[msg].key;
        ctx.session.data[dataKey] = null;
        ctx.session.step = idx;
        await sendPrompt(ctx, formData);
        return;
      } catch (err) {
        await ctx.reply(`${err.message}`);
        return;
      }
    }
  }
  const { step } = ctx.session;
  const { type, verify, success, error, process, key: dataKey } = entries[step];

  // process the response if the response is:
  if (type === "string") {
    let msg = ctx.message.text;
    if (process) {
      msg = process(msg);
    }
    try {
      if (verify(msg, ctx)) {
        await ctx.reply(success(ctx, msg));
        ctx.session.step += 1;
        ctx.session.data[dataKey] = msg;
      } else {
        ctx.reply(error(ctx, msg));
      }
    } catch (err) {
      await ctx.reply(`${error(ctx, msg)}, ${err.message}`);
    }
  } else if (type === "number") {
    let msg = ctx.message.text;
    try {
      if (process) {
        msg = process(msg);
      }
      const msgNumber = _.toNumber(msg);
      if (!msgNumber) throw Error("Give me a number!");

      if (verify(msgNumber, ctx)) {
        await ctx.reply(success(ctx, msgNumber));
        ctx.session.step += 1;
        ctx.session.data[dataKey] = msgNumber;
      } else {
        await ctx.reply(error(ctx, msg));
      }
    } catch (err) {
      await ctx.reply(error(ctx, msg));
    }
  } else if (type === "buttons") {
    let msg = "";
    try {
      if (!ctx.callbackQuery) {
        msg = ctx.message.text;
      } else {
        msg = ctx.callbackQuery.data;
      }
      if (process) {
        msg = process(msg);
      }
      if (verify(msg, ctx)) {
        await ctx.reply(success(ctx, msg));
        ctx.session.step += 1;
        ctx.session.data[dataKey] = msg;
      } else {
        await ctx.reply(error(ctx, msg));
      }
    } catch (err) {
      await ctx.reply(`${error(ctx, msg)}, ${err.message}`);
    }
  } else {
    console.log("Unknown type");
  }

  // The following part of the code handles the prompt to send after processing the response

  if (ctx.session.step < entries.length) {
    const nextDataKey = entries[ctx.session.step].key;
    if (ctx.session.data[nextDataKey]) {
      ctx.session.step = "verify";
    } else {
      await sendPrompt(ctx, formData);
      return;
    }
  }

  if (ctx.session.step === "verify" || ctx.session.step >= entries.length) {
    const { verifyPrompt } = formData;
    const finalResponses = ctx.session.data;
    const responsesButton = new InlineKeyboard();
    entries.forEach(({ title, key, display }, idx) => {
      responsesButton
        .text(
          `${title}: ${
            display ? display(finalResponses[key]) : finalResponses[key]
          }`,
          `${idx}`
        )
        .row();
    });
    responsesButton.text(`Submit`, "submit").row();
    await ctx.reply(
      verifyPrompt
        ? verifyPrompt()
        : `Here are your entries. Select an entry if you want to edit, or submit if  you're satisfied`,
      { reply_markup: responsesButton }
    );
    ctx.session.step = "verify";
  }
};

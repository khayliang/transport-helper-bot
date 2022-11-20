const { InlineKeyboard } = require('grammy');
const _ = require('lodash');
const { getUser } = require('../api/getUser');
const { getMessageData } = require('../utils/getMessageData');
const { endInteraction } = require('./endInteraction');

const sendPrompt = async (ctx, formData) => {
  const { entries } = formData;
  const { type: typeOfPrompt, buttons, prompt } = entries[ctx.session.step];
  if (typeOfPrompt === 'buttons') {
    await ctx.reply(prompt(), { reply_markup: buttons() });
  } else {
    await ctx.reply(prompt());
  }
};

const formInteractionTemplateUnlocked = async (ctx, formData) => {
  const { entries } = formData;
  const { step } = ctx.session;

  if (step === 'idle') {
    ctx.session.step = 0;
    const { onStart } = formData;
    try {
      if (onStart) await onStart(ctx);
    } catch (err) {
      return;
    }
  } else if (step === 'verify') {
    const msg = ctx.callbackQuery.data;
    if (msg === 'submit') {
      try {
        const { onFinish } = formData;
        const finalResponses = ctx.session.data;
        if (onFinish) await onFinish(ctx, finalResponses);
        await endInteraction(ctx);
        const userData = await getUser(ctx.from.id);
        ctx.session.user = userData;
        return;
      } catch (err) {
        await ctx.reply(`Whoops! Something seems to have went wrong: ${err.message}`);
      }
    } else {
      try {
        // check to see if response for verification is an idx
        const idx = _.toNumber(msg);
        if (!entries[idx]) {
          throw Error(
            "That doesn't seem to be something you can edit. Choose a valid entry",
          );
        }
        const dataKey = entries[msg].key;
        ctx.session.data[dataKey] = null;
        ctx.session.step = idx;
      } catch (err) {
        await ctx.reply(`${err.message}`);
      }
    }
  } else if (step === 'endconvo') {
    ctx.session.step = 0;
  } else {
    const {
      type, verify, success, error, process, key: dataKey,
    } = entries[step];
    try {
      let msg = await getMessageData(ctx);
      if (process) {
        msg = process({ ctx, data: msg });
      }
      if (type === 'number') {
        msg = _.toNumber(msg);
        if (!msg) throw Error('Give me a number!');
      }
      if (verify({ data: msg, ctx })) {
        await ctx.reply(success({ ctx, data: msg }));
        ctx.session.data[dataKey] = msg;
      } else {
        ctx.reply(error({ ctx, data: msg }));
      }
    } catch (err) {
      await ctx.reply(`${error({ ctx, data: err.message })}`);
    }
  }

  // The following part of the code handles the prompt to send after processing the response
  // dont send a prompt if currently having conversation
  if (ctx.session.step === 'convo') return;

  // this while loop checks for the next empty entry in data
  while (ctx.session.step < entries.length) {
    if (!ctx.session.data[entries[ctx.session.step].key]) break;
    ctx.session.step += 1;
  }
  if (ctx.session.step < entries.length) {
    await sendPrompt(ctx, formData);
  } else {
    ctx.session.step = 'verify';
    const { verifyPrompt } = formData;
    const finalResponses = ctx.session.data;
    const responsesButton = new InlineKeyboard();
    entries.forEach(({ title, key, display }, idx) => {
      responsesButton
        .text(
          `${title}: ${
            display ? display({ ctx, data: finalResponses[key] }) : finalResponses[key]
          }`,
          `${idx}`,
        )
        .row();
    });
    responsesButton.text('Submit', 'submit').row();
    await ctx.reply(
      verifyPrompt
        ? verifyPrompt()
        : 'Here are your entries. Select an entry if you want to edit, or submit if you\'re satisfied',
      { reply_markup: responsesButton },
    );
  }
};

module.exports.formInteractionTemplate = async (ctx, formData) => {
  const { locked } = ctx.session;
  if (!locked) {
    ctx.session.locked = true;
    await formInteractionTemplateUnlocked(ctx, formData);
    ctx.session.locked = false;
  }
};

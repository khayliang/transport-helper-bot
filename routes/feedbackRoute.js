const {
  formInteractionTemplate,
} = require('../interactions/formInteractionTemplate');
const { buildButtonFunction } = require('../utils/buildButtonFunction');

const feedbackForm = {
  entries: [
    {
      key: 'problem',
      title: 'Got a problem?',
      type: 'buttons',
      buttons: buildButtonFunction(Object.entries({ yes: 'Yes', no: 'No' })),
      verify: ({ data }) => {
        if (data === 'no') return false;
        return true;
      },
      prompt: () => 'You got problem with me is it?',
      success: () => 'Walao I do so much still want to complain.',
      error: () => 'Oi don\'t shy eh got problem then say lah',
    },
    {
      key: 'feedback',
      title: 'Feedback',
      type: 'string',
      verify: () => true,
      prompt: () => 'Got problem then say lah. Faster eh, Don\'t waste my time.',
      success: () => 'Noted with thanks',
      error: () => 'That doesn\'t seem like a valid car plate. Please enter a valid number e.g 33716',
    },
  ],
  onFinish: async (ctx, { feedback }) => {
    try {
      await ctx.reply('Thank you for the feedback!');
      // TODO: replace hardcoded id with owner acc in database
      await ctx.api.sendMessage(1021477408, 'You received new feedback!\n'
      + `From: ${ctx.session.user.name}\n${
        feedback}`);
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
};

module.exports.feedbackRoute = async (ctx) => {
  formInteractionTemplate(ctx, feedbackForm);
};

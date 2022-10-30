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
  onFinish: async (ctx) => {
    try {
      await ctx.reply('Feedback recorded!\nSike I don\'t care its not actually recorded (for the moment)');
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
};

module.exports.feedbackRoute = async (ctx) => {
  formInteractionTemplate(ctx, feedbackForm);
};

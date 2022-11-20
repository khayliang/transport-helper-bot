const moment = require('moment-timezone');
const {
  formInteractionTemplate,
} = require('../interactions/formInteractionTemplate');
const { isValidDate } = require('../utils/isValidDate');
const { buildButtonFunction } = require('../utils/buildButtonFunction');
const { commitmentsEnum } = require('../enums/commitmentsEnum');

const addCommitmentsForm = {
  entries: [
    {
      key: 'commitment_type',
      title: 'Type of Commitment',
      type: 'buttons',
      buttons: buildButtonFunction(Object.entries(commitmentsEnum)),
      verify: ({ data }) => {
        if (commitmentsEnum[data]) return true;
        return false;
      },
      display: ({ data }) => commitmentsEnum[data],
      prompt: () => 'What\'s the type of commitment?',
      success: ({ data }) => `Your commitment is ${commitmentsEnum[data]}.`,
      error: () => 'That doesn\'t seem like a valid commitment type. Please select a button',
    },
    {
      key: 'start_timestamp',
      title: 'Start Date',
      type: 'number',
      process: ({ data }) => {
        if (!isValidDate(data)) throw Error('Invalid date format');
        const startTimestamp = moment(data, 'DD/MM/YYYY').toDate();
        return startTimestamp.getTime();
      },
      verify: () => true,
      display: ({ data }) => `${new Date(data).toDateString()}`,
      prompt: () => 'When does this commitment start? Enter in format DD/MM/YYYY',
      success: ({ data }) => {
        const date = new Date(data);
        return `${date.toDateString()} seems to be the date.`;
      },
      error: () => 'Please enter a valid date. Enter in format DD/MM/YYYY',
    },
    {
      key: 'end_timestamp',
      title: 'End Date',
      type: 'buttons',
      buttons: buildButtonFunction([['same_date', 'Single Day Event']]),
      process: ({ data, ctx }) => {
        if (data === 'same_date') return ctx.session.data.start_timestamp;
        if (!isValidDate(data)) throw Error('Invalid date format');
        const lastActivity = moment(data, 'DD/MM/YYYY').toDate();
        return lastActivity.getTime();
      },
      verify: () => true,
      display: ({ data }) => `${new Date(data).toDateString()}`,
      prompt: () => 'When does this commitment end? Enter in format DD/MM/YYYY',
      success: ({ data }) => {
        const date = new Date(data);
        return `${date.toDateString()} seems to be the date.`;
      },
      error: () => 'Please enter a valid date. Enter in format DD/MM/YYYY',
    },
    {
      key: 'location',
      title: 'Location',
      type: 'buttons',
      buttons: buildButtonFunction([['nil', 'Not Applicable']]),
      verify: ({ data }) => (!(data.length > 20)),
      prompt: () => 'If you\'re applying for MA or overseas leave, where is the location?',
      success: () => 'Awesome!',
      display: ({ data }) => (data === 'nil' ? 'Not Applicable' : data),
      error: () => 'Limit your message to 20 characters',
    },
    {
      key: 'purpose',
      title: 'Purpose',
      type: 'buttons',
      buttons: buildButtonFunction([['nil', 'Not Applicable']]),
      verify: ({ data }) => (!(data.length > 20)),
      prompt: () => 'If you\'re applying for MA, briefly state the purpose.',
      success: () => 'Sounds fun!',
      display: ({ data }) => (data === 'nil' ? 'Not Applicable' : data),
      error: () => 'Limit your message to 20 characters',
    },
  ],
  onFinish: async (ctx, responses) => {
    try {
      /* await createNewActivity({
        ...responses,
        telegram_id: ctx.from.id,
      }); */
      await ctx.reply(`${JSON.stringify(responses)}`);
      await ctx.reply('Commitment has been added! A message has been sent to your commander.');
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
};

module.exports.addCommitmentsRoute = async (ctx) => {
  formInteractionTemplate(ctx, addCommitmentsForm);
};

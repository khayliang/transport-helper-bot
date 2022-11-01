const _ = require('lodash');

const moment = require('moment');
const {
  formInteractionTemplate,
} = require('../interactions/formInteractionTemplate');
const { activitiesEnum } = require('../enums/activitiesEnum');
const { createNewActivity } = require('../api/createNewActivity');
const { isValidDate } = require('../utils/isValidDate');
const { buildButtonFunction } = require('../utils/buildButtonFunction');

const addActivityForm = {
  entries: [
    {
      key: 'vehicle_no',
      title: 'Car plate number',
      type: 'number',
      verify: () => true,
      prompt: () => 'What\'s the vehicle car plate?',
      success: ({ data }) => `Your vehicle is ${data}.`,
      error: () => 'That doesn\'t seem like a valid car plate. Please enter a valid number e.g 33716',
    },
    {
      key: 'vehicle_class',
      title: 'Vehicle class',
      type: 'buttons',
      buttons: buildButtonFunction([[3, 'Class 3'], [4, 'Class 4']]),
      process: ({ data }) => _.toNumber(data),
      verify: ({ data }) => {
        if (data === 3 || data === 4) return true;
        return false;
      },
      prompt: () => 'What is the vehicle class?',
      success: ({ data }) => `Class ${data}? Great!`,
      error: ({ data }) => `Never heard of Class ${data} before... Please select a correct class`,
    },
    {
      key: 'activity_type',
      title: 'Activity type',
      type: 'buttons',
      buttons: buildButtonFunction(Object.entries(activitiesEnum)),
      verify: ({ data }) => {
        if (activitiesEnum[data]) return true;
        return false;
      },
      display: ({ data }) => `${activitiesEnum[data]}`,
      prompt: () => 'What type of activity was it?',
      success: ({ data }) => `${activitiesEnum[data]}? Great!`,
      error: ({ data }) => `Never heard of ${data} before... Please select a valid activity`,
    },
    {
      key: 'timestamp',
      title: 'Time of activity',
      type: 'buttons',
      buttons: () => null,
      process: ({ data }) => {
        if (!isValidDate(data)) throw Error('Invalid date format');
        const lastActivity = moment(data, 'DD/MM/YYYY').toDate();
        if (lastActivity.getTime() > Date.now()) throw Error('date is in the future');
        return lastActivity.getTime();
      },
      verify: () => true,
      display: ({ data }) => `${new Date(data).toDateString()}`,
      prompt: () => 'What is date of the activity?\nType the date in the format DD/MM/YYYY',
      success: ({ data }) => {
        const date = new Date(data);
        return `${date.toDateString()} seems to be the date.`;
      },
      error: () => 'Please enter a valid date. Enter in format DD/MM/YYYY or select the \'Today\' button',
    },
    {
      key: 'initial_mileage',
      title: 'Initial mileage',
      type: 'number',
      verify: () => true,
      prompt: () => 'What\'s the initial mileage of the activity?',
      success: ({ data }) => `Initial mileage was ${data}.`,
      error: () => 'Please enter a valid mileage',
    },
    {
      key: 'final_mileage',
      title: 'Final mileage',
      type: 'number',
      verify: ({ data, ctx }) => {
        const initialMileage = ctx.session.data.initial_mileage;
        return data >= initialMileage;
      },
      prompt: () => 'What\'s the final mileage of the activity?',
      success: ({ data }) => `Final mileage was ${data}.`,
      error: () => 'Please enter a valid final mileage. Your final mileage might be less than your initial.',
    },
  ],
  onFinish: async (ctx, responses) => {
    try {
      console.log({...responses, telegram_id: ctx.from.id})
      await createNewActivity({
        ...responses,
        telegram_id: ctx.from.id,
      });
      await ctx.reply('Activity has been added!');
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
};

module.exports.addActivityRoute = async (ctx) => formInteractionTemplate(ctx, addActivityForm);

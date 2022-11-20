const _ = require('lodash');

const moment = require('moment-timezone');
const {
  formInteractionTemplate,
} = require('../interactions/formInteractionTemplate');
const { activitiesEnum } = require('../enums/activitiesEnum');
const { createNewActivity } = require('../api/createNewActivity');
const { isValidDate } = require('../utils/isValidDate');
const { buildButtonFunction } = require('../utils/buildButtonFunction');
const { endInteraction } = require('../interactions/endInteraction');

const addMileageUpdateForm = {
  entries: [
    {
      key: 'vehicleNo',
      title: 'Car plate number',
      type: 'number',
      verify: ({ data }) => `${data}`.length === 5,
      prompt: () => 'What\'s the vehicle car plate?',
      error: () => 'That doesn\'t seem like a valid car plate. Please enter a valid number e.g 33716',
    },
    {
      key: 'timestamp',
      title: 'Time of activity',
      type: 'buttons',
      buttons: () => (buildButtonFunction([[moment(new Date()).format('DDMMYY'), 'Today']])()),
      process: ({ data }) => {
        if (!isValidDate(data)) throw Error('Invalid date format');
        const lastActivity = moment(data, 'DDMMYY').toDate();
        if (lastActivity.getTime() > Date.now()) throw Error('date is in the future');
        return lastActivity.getTime();
      },
      verify: () => true,
      display: ({ data }) => `${new Date(data).toDateString()}`,
      prompt: () => 'What is date of the activity?\nType the date in the format DDMMYY, or press \'Today\'',
      error: () => 'Please enter a valid date. Enter in format DDMMYY or select the \'Today\' button',
    },
    {
      key: 'initialMileage',
      title: 'Initial mileage',
      type: 'number',
      verify: () => true,
      prompt: () => 'What\'s the initial mileage of the activity?',
      error: () => 'Please enter a valid mileage',
    },
    {
      key: 'finalMileage',
      title: 'Final mileage',
      type: 'number',
      verify: ({ data, ctx }) => {
        const initialMileage = ctx.session.data.initial_mileage;
        return data >= initialMileage;
      },
      prompt: () => 'What\'s the final mileage of the activity?',
      error: () => 'Please enter a valid final mileage. Your final mileage might be less than your initial.',
    },
    {
      key: 'vehicleClass',
      title: 'Vehicle class',
      type: 'buttons',
      buttons: buildButtonFunction([[3, 'Class 3'], [4, 'Class 4']]),
      process: ({ data }) => _.toNumber(data),
      verify: ({ data }) => {
        if (data === 3 || data === 4) return true;
        return false;
      },
      prompt: () => 'What is the vehicle class?',
      error: ({ data }) => `Never heard of Class ${data} before... Please select a correct class`,
    },
    {
      key: 'activityType',
      title: 'Activity type',
      type: 'buttons',
      buttons: buildButtonFunction(Object.entries(activitiesEnum)),
      verify: ({ data }) => {
        if (activitiesEnum[data]) return true;
        return false;
      },
      display: ({ data }) => `${activitiesEnum[data]}`,
      prompt: () => 'What type of activity was it?',
      error: ({ data }) => `Never heard of ${data} before... Please select a valid activity`,
    },
  ],
  onStart: async (ctx) => {
    try {
      ctx.session.step = 'convo';
      await ctx.conversation.enter('getMileageUpdateConvo');
    } catch (err) {
      await endInteraction(ctx);
    }
  },
  onFinish: async (ctx, responses) => {
    try {
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

module.exports.addMileageUpdateRoute = async (ctx) => {
  formInteractionTemplate(ctx, addMileageUpdateForm);
};
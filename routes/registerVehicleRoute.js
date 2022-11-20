const moment = require('moment-timezone');

const {
  formInteractionTemplate,
} = require('../interactions/formInteractionTemplate');
const { registerVehicle } = require('../api/registerVehicle');
const { isValidDate } = require('../utils/isValidDate');
const { buildButtonFunction } = require('../utils/buildButtonFunction');

const { nodesEnum } = require('../enums/nodesEnum');
const { modelsEnum } = require('../enums/modelsEnum');
const { activitiesEnum } = require('../enums/activitiesEnum');

const registerVehicleForm = {
  entries: [
    {
      key: 'node',
      title: 'Node',
      type: 'buttons',
      buttons: buildButtonFunction(Object.entries(nodesEnum)),
      verify: ({ data }) => {
        if (nodesEnum[data]) return true;
        return false;
      },
      prompt: () => 'What node is your vehicle from?',
      error: ({ data }) => `Never heard of ${data} before... Please select a valid node`,
    },
    {
      key: 'vehicle_no',
      title: 'Car plate number',
      type: 'number',
      verify: ({ data }) => `${data}`.length === 5,
      prompt: () => 'What\'s the vehicle car plate? e.g 33716',
      success: ({ data }) => `${data}... Hopefully that vehicle has air conditioning`,
      error: () => 'That doesn\'t seem like a valid car plate. Please enter a valid 5 digit number e.g 33716',
    },
    {
      key: 'model',
      title: 'Vehicle model',
      type: 'buttons',
      buttons: buildButtonFunction(
        Object.keys(modelsEnum).map((key) => [key, modelsEnum[key].name]),
      ),
      verify: ({ data }) => {
        if (modelsEnum[data]) return true;
        return false;
      },
      display: ({ data }) => `${modelsEnum[data].name}`,
      prompt: () => "What's the vehicle model?",
      error: ({ data }) => `Never heard of ${data} before... Please select a valid model`,
    },
    {
      key: 'current_mileage',
      title: 'Current mileage',
      type: 'number',
      verify: () => true,
      prompt: () => 'What\'s the current mileage of the vehicle?',
      error: () => 'Please enter a valid mileage',
    },
    {
      key: 'last_topup_mileage',
      title: 'Mileage at last topup',
      type: 'number',
      verify: ({ data, ctx }) => data <= ctx.session.data.current_mileage,
      prompt: () => 'What was the mileage of its last topup?',
      error: () => 'Please enter a valid mileage',
    },
    {
      key: 'last_activity_timestamp',
      title: 'Time of last activity',
      type: 'number',
      process: ({ data }) => {
        if (!isValidDate(data)) throw Error('Invalid date format');
        const lastActivity = moment(data, 'DDMMYY').toDate();

        if (lastActivity.getTime() > Date.now()) throw Error('date is in the future');
        return lastActivity.getTime();
      },
      verify: () => true,
      display: ({ data }) => `${new Date(data).toDateString()}`,
      prompt: () => 'What is date of the last vehicle activity? Enter in format DDMMYY',
      error: () => 'Please enter a valid date. Enter in format DDMMYY',
    },
    {
      key: 'last_activity_type',
      title: 'Last activity type',
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
  onFinish: async (ctx, responses) => {
    try {
      const { model } = responses;
      await registerVehicle({
        ...responses,
        vehicleClass: modelsEnum[model].class,
      });
      await ctx.reply('Vehicle has been added!');
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
};

module.exports.registerVehicleRoute = async (ctx) => {
  formInteractionTemplate(ctx, registerVehicleForm);
};

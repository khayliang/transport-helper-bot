const _ = require('lodash');
const moment = require('moment');

const { getVehicle } = require('../api/getVehicle');

const {
  formInteractionTemplate,
} = require('../interactions/formInteractionTemplate');

const getVehicleForm = {
  entries: [
    {
      key: 'vehicle_no',
      title: 'Vehicle no',
      type: 'number',
      verify: ({ data }) => {
        if (`${data}`.length === 5) return true;
        return false;
      },
      prompt: () => 'What vehicle do you want to view?',
      success: ({ data }) => `You want to view vehicle ${data}`,
      error: () => 'That doesn\'t seem like a valid number. Please enter a valid vehicle number',
    },
  ],
  verifyPrompt: () => "Select an entry if you want to edit, or submit if you're ready.",
  onFinish: async (ctx, { vehicle_no }) => {
    try {
      const vehicleData = await getVehicle(vehicle_no);
      await ctx.reply(`Raw vehicle data: \n\n${JSON.stringify(vehicleData)}`);
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
};
module.exports.getVehicleRoute = async (ctx) => {
  formInteractionTemplate(ctx, getVehicleForm);
};

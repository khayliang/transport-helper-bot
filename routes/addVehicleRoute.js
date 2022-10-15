const { object, string, number } = require("yup");
const _ = require("lodash");
const { InlineKeyboard } = require("grammy");

const { endInteraction } = require("../interactions/endInteraction");
const { nodesEnum } = require("../enums/nodesEnum");
const {
  formInteractionTemplate,
} = require("../interactions/formInteractionTemplate");
const moment = require("moment");
const { createNewVehicle } = require("../api/createNewVehicle");
const { isValidDate } = require("../utils/isValidDate");

const modelsEnum = {
  five_ton: {
    name: "Five Tonner",
    class: 4,
  },
  ouv: {
    name: "OUV",
    class: 3,
  },
  mb: {
    name: "MB 290",
    class: 4,
  },
  combat_amby: {
    name: "Combat Ambulance",
    class: 4,
  },
};

const addVehicleForm = {
  entries: [
    {
      key: "node",
      title: "Node",
      type: "buttons",
      buttons: () => {
        const nodeButtons = new InlineKeyboard();
        for (const node in nodesEnum) {
          nodeButtons.text(nodesEnum[node], node).row();
        }
        return nodeButtons;
      },
      verify: (data) => {
        if (nodesEnum[data]) return true;
        else return false;
      },
      prompt: (ctx, data) => "What node is your vehicle from?",
      success: (ctx, data) => `${nodesEnum[data]}? That's nice`,
      error: (ctx, data) =>
        `Never heard of ${data} before... Please select a valid node`,
    },
    {
      key: "vehicle_no",
      title: "Car plate number",
      type: "number",
      verify: (data) => true,
      prompt: (ctx, data) => `What's the vehicle car plate?`,
      success: (ctx, data) =>
        `${data}... Hopefully that vehicle has air conditioning`,
      error: (ctx, data) =>
        `That doesn't seem like a valid car plate. Please enter a valid number e.g 33716`,
    },
    {
      key: "model",
      title: "Vehicle model",
      type: "buttons",
      buttons: () => {
        const modelButtons = new InlineKeyboard();
        for (const model in modelsEnum) {
          modelButtons.text(modelsEnum[model].name, model).row();
        }
        return modelButtons;
      },
      verify: (data) => {
        if (modelsEnum[data]) return true;
      },
      display: (data) => `${modelsEnum[data].name}`,
      prompt: (ctx, data) => "What's the vehicle model?",
      success: (ctx, data) => {
        ctx.session.data.vehicle_class = modelsEnum[data].class;
        return `${modelsEnum[data].name}? Cool beans.`;
      },
      error: (ctx, data) =>
        `Never heard of ${data} before... Please select a valid model`,
    },
    {
      key: "current_mileage",
      title: "Current mileage",
      type: "number",
      verify: (data) => true,
      prompt: (ctx, data) => `What's the current mileage of the vehicle?`,
      success: (ctx, data) => `${data}. Wow, that's quite a distance.`,
      error: (ctx, data) => `Please enter a valid mileage`,
    },
    {
      key: "last_topup_mileage",
      title: "Mileage at last topup",
      type: "number",
      verify: (data, ctx) => data <= ctx.session.data.current_mileage,
      prompt: (ctx, data) => `What was the mileage of its last topup?`,
      success: (ctx, data) =>
        `${data}. It's been some time since your last topup.`,
      error: (ctx, data) => `Please enter a valid mileage`,
    },
    {
      key: "last_activity_timestamp",
      title: "Time of last activity",
      type: "number",
      process: (data) => {
        if (!isValidDate(data)) throw Error("Invalid date format");
        const lastActivity = moment(data, "DD/MM/YYYY").toDate();

        if (lastActivity.getTime() > Date.now())
          throw Error("date is in the future");
        return lastActivity.getTime();
      },
      verify: () => true,
      display: (data) => `${new Date(data).toDateString()}`,
      prompt: (ctx, data) =>
        `What is date of the last vehicle movement/WPT? Enter in format DD/MM/YYYY`,
      success: (ctx, data) => {
        const date = new Date(data);
        return `${date.toDateString()} seems to be the date.`;
      },
      error: (ctx, data) =>
        `Please enter a valid date. Enter in format DD/MM/YYYY`,
    },
  ],
  onFinish: async (ctx, responses) => {
    try {
      await createNewVehicle(responses);
      await ctx.reply(`Vehicle has been added!`);
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
};

module.exports.addVehicleRoute = async (ctx) =>
  formInteractionTemplate(ctx, addVehicleForm);

const { object, string, number } = require("yup");
const _ = require("lodash");
const { InlineKeyboard } = require("grammy");

const {
  formInteractionTemplate,
} = require("../interactions/formInteractionTemplate");
const moment = require("moment");
const { activitiesEnum } = require("../enums/activitiesEnum");
const { createNewActivity } = require("../api/createNewActivity");
const { isValidDate } = require("../utils/isValidDate");

const steps = [
  {
    key: "vehicle_no",
    title: "Car plate number",
  },
  {
    key: "vehicle_class",
    title: "Vehicle class",
  },
  {
    key: "activity_type",
    title: "Activity type",
  },
  {
    key: "timestamp",
    title: "Time of activity",
  },
  {
    key: "initial_mileage",
    title: "Initial mileage",
  },
  {
    key: "final_mileage",
    title: "Final mileage",
  },
];

const addActivityForm = {
  vehicle_no: {
    type: "number",
    verify: (data) => true,
    prompt: (ctx, data) => `What's the vehicle car plate?`,
    success: (ctx, data) => `Your vehicle is ${data}.`,
    error: (ctx, data) =>
      `That doesn't seem like a valid car plate. Please enter a valid number e.g 33716`,
  },
  vehicle_class: {
    type: "buttons",
    buttons: () => {
      const activityButtons = new InlineKeyboard();
      activityButtons.text("Class 3", 3).row();
      activityButtons.text("Class 4", 4).row();
      return activityButtons;
    },
    process: (data) => {
      return _.toNumber(data);
    },
    verify: (data) => {
      if (data === 3 || data === 4) return true;
      else return false;
    },
    prompt: (ctx, data) => "What is the vehicle class?",
    success: (ctx, data) => `Class ${data}? Great!`,
    error: (ctx, data) =>
      `Never heard of Class ${data} before... Please select a correct class`,
  },
  activity_type: {
    type: "buttons",
    buttons: () => {
      const activityButtons = new InlineKeyboard();
      for (const activity in activitiesEnum) {
        activityButtons.text(activitiesEnum[activity], activity).row();
      }
      return activityButtons;
    },
    verify: (data) => {
      if (activitiesEnum[data]) return true;
      else return false;
    },
    prompt: (ctx, data) => "What type of activity was it?",
    success: (ctx, data) => `${activitiesEnum[data]}? Great!`,
    error: (ctx, data) =>
      `Never heard of ${data} before... Please select a valid activity`,
  },
  timestamp: {
    type: "buttons",
    buttons: () => {
      const timeButton = new InlineKeyboard();
      timeButton.text("Today", moment(new Date()).format("DD/MM/YYYY")).row();
      return timeButton;
    },
    process: (data) => {
      if (!isValidDate(data)) throw Error("Invalid date format");
      const lastActivity = moment(data, "DD/MM/YYYY").toDate();
      if (lastActivity.getTime() > Date.now())
        throw Error("date is in the future");
      return lastActivity.getTime();
    },
    verify: () => true,
    prompt: (ctx, data) =>
      `What is date of the activity?\nType the date in the format DD/MM/YYYY, or choose the button`,
    success: (ctx, data) => {
      const date = new Date(data);
      return `${date.toDateString()} seems to be the date.`;
    },
    error: (ctx, data) =>
      `Please enter a valid date. Enter in format DD/MM/YYYY or select the 'Today' button`,
  },
  initial_mileage: {
    type: "number",
    verify: (data) => true,
    prompt: (ctx, data) => `What's the initial mileage of the activity?`,
    success: (ctx, data) => `Initial mileage was ${data}.`,
    error: (ctx, data) => `Please enter a valid mileage`,
  },
  final_mileage: {
    type: "number",
    verify: (data, ctx) => {
      const initialMileage = ctx.session.data.initial_mileage;
      return data >= initialMileage;
    },
    prompt: (ctx, data) => `What's the final mileage of the activity?`,
    success: (ctx, data) => `Final mileage was ${data}.`,
    error: (ctx, data) =>
      `Please enter a valid final mileage. Your final mileage might be less than your initial.`,
  },

  onFinish: async (ctx, responses) => {
    try {
      await createNewActivity({
        ...responses,
        telegram_id: ctx.session.user.telegram_id,
      });
      await ctx.reply(`Activity has been added!`);
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
  parseResponsesForDisplaying: (responses) => {
    let responsesForDisplay = {};
    for (key in responses) {
      const data = responses[key];
      if (key === "vehicle_no") {
        responsesForDisplay.vehicle_no = `${data}`;
      } else if (key === "vehicle_class") {
        responsesForDisplay.vehicle_class = `${data}`;
      } else if (key === "activity_type") {
        responsesForDisplay.activity_type = `${activitiesEnum[data]}`;
      } else if (key === "initial_mileage") {
        responsesForDisplay.initial_mileage = `${data}`;
      } else if (key === "final_mileage") {
        responsesForDisplay.final_mileage = `${data}`;
      } else if (key === "timestamp") {
        const date = new Date(data);
        responsesForDisplay.timestamp = `${date.toDateString()}`;
      }
    }
    return responsesForDisplay;
  },
};

module.exports.addActivityRoute = async (ctx) =>
  formInteractionTemplate(ctx, addActivityForm, steps);

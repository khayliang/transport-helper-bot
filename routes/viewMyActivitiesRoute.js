const { InlineKeyboard } = require("grammy");
const _ = require("lodash");
const moment = require("moment");

const { getUserActivity } = require("../api/getUserActivity");
const { monthsEnum } = require("../enums/monthsEnum");
const {
  formInteractionTemplate,
} = require("../interactions/formInteractionTemplate");

const viewMyActivitiesForm = {
  entries: [
    {
      key: "year",
      title: "Year",
      type: "number",
      verify: (data) => {
        if (!/\d{4}/.test(data)) return false;
        if (data > new Date().getFullYear()) return false;
        return true;
      },
      prompt: (ctx, data) => `What year do you want to view?`,
      success: (ctx, data) => `You want to view the year of ${data}`,
      error: (ctx, data) =>
        `That doesn't seem like a year. Please enter a valid year`,
    },
    {
      key: "month",
      title: "Month",
      type: "buttons",
      buttons: () => {
        const monthsButton = new InlineKeyboard();
        monthsEnum.forEach((month, idx) => {
          monthsButton.text(month, idx);
          if (idx === 5) monthsButton.row();
        });
        return monthsButton;
      },
      process: (data) => {
        const month = _.toNumber(data);
        return month;
      },
      verify: (data) => {
        if (monthsEnum[data]) return true;
        else return false;
      },
      display: (data) => `${monthsEnum[data]}`,
      prompt: (ctx, data) => `What month do you want to view?`,
      success: (ctx, data) => `You want to view ${monthsEnum[data]}`,
      error: (ctx, data) =>
        `What is ${data}? I never heard of that month before... Please select a valid month`,
    },
  ],
  verifyPrompt: (ctx) =>
    "You want to view these dates. Select an entry if you want to edit, or submit if you're ready.",
  onFinish: async (ctx, responses) => {
    try {
      const activities = await getUserActivity({
        ...responses,
        telegram_id: `${ctx.session.user.telegram_id}`,
      });
      let activityMsg = "";
      activities.forEach((activity, idx) => {
        const {
          initial_mileage,
          final_mileage,
          timestamp,
          vehicle_class,
          vehicle_no,
        } = activity;
        activityMsg = `Vehicle no: ${vehicle_no}, class: ${vehicle_class}, date: ${moment(
          new Date(timestamp)
        ).format(
          "DD/MM/YYYY"
        )}\ninitial/final mileage: ${initial_mileage}-${final_mileage}, distance travelled: ${
          _.toNumber(final_mileage) - _.toNumber(initial_mileage)
        }\n\n`;
      });
      await ctx.reply(`Your activities are as follows:\n\n` + activityMsg);
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
};
module.exports.viewMyActivitiesRoute = async (ctx) =>
  formInteractionTemplate(ctx, viewMyActivitiesForm);

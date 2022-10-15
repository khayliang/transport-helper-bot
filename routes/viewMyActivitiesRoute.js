const { InlineKeyboard } = require('grammy');
const _ = require('lodash');
const moment = require('moment');

const { getUserActivity } = require('../api/getUserActivity');
const { monthsEnum } = require('../enums/monthsEnum');
const {
  formInteractionTemplate,
} = require('../interactions/formInteractionTemplate');

const viewMyActivitiesForm = {
  entries: [
    {
      key: 'year',
      title: 'Year',
      type: 'number',
      verify: ({ data }) => {
        if (!/\d{4}/.test(data)) return false;
        if (data > new Date().getFullYear()) return false;
        return true;
      },
      prompt: () => 'What year do you want to view?',
      success: ({ data }) => `You want to view the year of ${data}`,
      error: () => 'That doesn\'t seem like a year. Please enter a valid year',
    },
    {
      key: 'month',
      title: 'Month',
      type: 'buttons',
      buttons: () => {
        const monthsButton = new InlineKeyboard();
        monthsEnum.forEach((month, idx) => {
          monthsButton.text(month, idx);
          if (idx === 5) monthsButton.row();
        });
        return monthsButton;
      },
      process: ({ data }) => {
        const month = _.toNumber(data);
        return month;
      },
      verify: ({ data }) => {
        if (monthsEnum[data]) return true;
        return false;
      },
      display: ({ data }) => `${monthsEnum[data]}`,
      prompt: () => 'What month do you want to view?',
      success: ({ data }) => `You want to view ${monthsEnum[data]}`,
      error: ({ data }) => `What is ${data}? I never heard of that month before... Please select a valid month`,
    },
  ],
  verifyPrompt: () => "You want to view these dates. Select an entry if you want to edit, or submit if you're ready.",
  onFinish: async (ctx, responses) => {
    try {
      const activities = await getUserActivity({
        ...responses,
        telegramId: `${ctx.session.user.telegramId}`,
      });
      let activityMsg = '';
      activities.forEach((activity) => {
        const {
          initialMileage,
          finalMileage,
          timestamp,
          vehicleClass,
          vehicleNo,
        } = activity;
        activityMsg = `Vehicle no: ${vehicleNo}, class: ${vehicleClass}, date: ${moment(
          new Date(timestamp),
        ).format(
          'DD/MM/YYYY',
        )}\ninitial/final mileage: ${initialMileage}-${finalMileage}, distance travelled: ${
          _.toNumber(finalMileage) - _.toNumber(initialMileage)
        }\n\n`;
      });
      await ctx.reply(`Your activities are as follows:\n\n${activityMsg}`);
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
};
module.exports.viewMyActivitiesRoute = async (ctx) => {
  formInteractionTemplate(ctx, viewMyActivitiesForm);
};

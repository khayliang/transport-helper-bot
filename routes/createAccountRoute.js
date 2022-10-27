const { nodesEnum } = require('../enums/nodesEnum');
const { createNewUser } = require('../api/createNewUser');
const {
  formInteractionTemplate,
} = require('../interactions/formInteractionTemplate');
const { buildButtonFunction } = require('../utils/buildButtonFunction');
const { rolesEnum } = require('../enums/rolesEnum');

const createAccountForm = {
  entries: [
    {
      key: 'name',
      title: 'Name',
      type: 'string',
      verify: () => true,
      prompt: () => 'First, tell me your name as written in your 11B!',
      success: ({ data }) => `Hello ${data}!`,
      error: () => "This shouldn't happen...",
    },
    {
      key: 'nric',
      title: 'NRIC',
      type: 'string',
      verify: ({ data }) => /^\d{3}[a-zA-Z]$/.test(data),
      prompt: () => 'Now, may I have the last 4 characters of your NRIC? For example, 123A',
      success: () => 'Hey, thats a lucky number!',
      error: () => 'Whoops! Seems like the NRIC you gave me is invalid. Please try again',
    },
    {
      key: 'role',
      title: 'Role',
      type: 'buttons',
      buttons: buildButtonFunction(Object.entries(rolesEnum)),
      verify: ({ data }) => {
        if (rolesEnum[data]) return true;
        return false;
      },
      display: ({ data }) => rolesEnum[data],
      prompt: () => 'What\'s your role in the node?',
      success: ({ data }) => `Being a ${rolesEnum[data]} sounds fun!`,
      error: ({ data }) => `What is ${data}? I never heard of that role before... Please select a valid role`,
    },
    {
      key: 'rank',
      title: 'Rank',
      type: 'string',
      verify: ({ data }) => /\w{3}/.test(data),
      prompt: () => 'What\'s your rank?',
      success: ({ data }) => `${data}? Wow, very respectable!`,
      error: () => `Please enter 3 letters only`,
    },
    {
      key: 'army_unit',
      title: 'Node',
      type: 'buttons',
      buttons: buildButtonFunction(Object.entries(nodesEnum)),
      verify: ({ data }) => {
        if (nodesEnum[data]) return true;
        return false;
      },
      display: ({ data }) => nodesEnum[data],
      prompt: () => 'What node are you from?',
      success: ({ data }) => `${nodesEnum[data]}! I heard a lot of stories about that place...`,
      error: ({ data }) => `What is ${data}? I never heard of that node before... Please select a valid node`,
    },
    {
      key: 'total_mileage',
      title: 'Current Mileage',
      type: 'number',
      verify: () => true,
      prompt: () => 'What\'s your current mileage?',
      success: () => 'Wow, you\'ve been hard at work...',
      error: () => 'That doesn\'t seem like a number. Please enter a valid mileage',
    },
  ],
  onStart: async (ctx) => {
    await ctx.reply(
      "It seems like you're new here. Let's create a new account.",
    );
  },
  onFinish: async (ctx, responses) => {
    try {
      await createNewUser({
        ...responses,
        telegram_id: ctx.from.id,
      });
      await ctx.reply('Your account has been created!');
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
};

module.exports.createAccountRoute = async (ctx) => formInteractionTemplate(ctx, createAccountForm);

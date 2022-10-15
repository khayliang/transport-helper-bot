const { InlineKeyboard } = require("grammy");
const { nodesEnum } = require("../enums/nodesEnum");
const _ = require("lodash");
const { endInteraction } = require("../interactions/endInteraction");
const { createNewUser } = require("../api/createNewUser");
const {
  formInteractionTemplate,
} = require("../interactions/formInteractionTemplate");

const rolesEnum = {
  tpt_opr: "Transport Operator",
  admin: "Admin Support",
  cmdr: "Commander",
};

const createAccountForm = {
  entries: [
    {
      key: "name",
      title: "Name",
      type: "string",
      verify: () => true,
      prompt: (ctx, data) => "First, tell me your name as written in your 11B!",
      success: (ctx, data) => `Hello ${data}!`,
      error: (ctx, data) => "This shouldn't happen...",
    },
    {
      key: "nric",
      title: "NRIC",
      type: "string",
      verify: (data) => /^\d{3}[a-zA-Z]$/.test(data),
      prompt: (ctx, data) =>
        `Now, may I have the last 4 characters of your NRIC? For example, 123A`,
      success: (ctx, data) => "Hey, thats a lucky number!",
      error: (ctx, data) =>
        "Whoops! Seems like the NRIC you gave me is invalid. Please try again",
    },
    {
      key: "rank",
      title: "Role",
      type: "buttons",
      buttons: () => {
        const rolesButtons = new InlineKeyboard();
        for (const role in rolesEnum) {
          rolesButtons.text(rolesEnum[role], role).row();
        }
        return rolesButtons;
      },
      verify: (data) => {
        if (rolesEnum[data]) return true;
        else return false;
      },
      prompt: (ctx, data) => `What's your role in the node?`,
      success: (ctx, data) => `Being a ${rolesEnum[data]} sounds fun!`,
      error: (ctx, data) =>
        `What is ${data}? I never heard of that role before... Please select a valid role`,
    },
    {
      key: "army_unit",
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
      prompt: (ctx, data) => `What node are you from?`,
      success: (ctx, data) =>
        `${nodesEnum[data]}! I heard a lot of stories about that place...`,
      error: (ctx, data) =>
        `What is ${data}? I never heard of that node before... Please select a valid node`,
    },
    {
      key: "total_mileage",
      title: "Current Mileage",
      type: "number",
      verify: () => true,
      prompt: (ctx, data) => `What's your current mileage?`,
      success: (ctx, data) => `Wow, you've been hard at work...`,
      error: (ctx, data) =>
        `That doesn't seem like a number. Please enter a valid mileage`,
    },
  ],
  onStart: async (ctx) => {
    ctx.session.data.telegram_id = `${ctx.from.id}`;
    await ctx.reply(
      "It seems like you're new here. Let's create a new account."
    );
  },
  onFinish: async (ctx, responses) => {
    try {
      await createNewUser(responses);
      await ctx.reply("Your account has been created!");
    } catch (err) {
      await ctx.reply(`Oops, something went wrong. ${err.message}`);
    }
  },
  parseResponsesForDisplaying: (responses) => {
    let responsesForDisplay = {};
    for (key in responses) {
      const data = responses[key];
      if (key === "name") {
        responsesForDisplay.name = data;
      } else if (key === "nric") {
        responsesForDisplay.nric = data;
      } else if (key === "rank") {
        responsesForDisplay.rank = rolesEnum[data];
      } else if (key === "army_unit") {
        responsesForDisplay.army_unit = nodesEnum[data];
      } else if (key === "total_mileage") {
        responsesForDisplay.total_mileage = `${data}`;
      }
    }
    return responsesForDisplay;
  },
};

module.exports.createAccountRoute = async (ctx) =>
  formInteractionTemplate(ctx, createAccountForm);

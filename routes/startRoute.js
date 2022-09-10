const { getUser } = require("../api/getUser");
const { commandsList } = require("../enums/commandsList");
const { createAccountRoute } = require("./createAccountRoute");

module.exports.startRoute = async (ctx) => {
  ctx.session.route = "start";
  await ctx.reply(
    `Hello! I'm Tracy the Transport Triangle. I can help you track and manage ` +
      `all your mileage and vehicle movement matters. Nice to meet you!` +
      `\n\nYou can control me by sending these commands:\n\n` +
      `${(() => {
        let stringToAdd = "";
        commandsList.forEach(({ command, description }, idx) => {
          stringToAdd += `/${command}: ${description}\n`;
        });
        return stringToAdd;
      })()}`
  );
};

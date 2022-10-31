const { commandsList } = require('../enums/commandsList');

module.exports.startRoute = async (ctx) => {
  ctx.session.route = 'start';
  await ctx.reply(
    'Hello! I\'m Tracy the Transport Turtle. I can help you track and manage '
      + 'all your mileage and vehicle movement matters. Nice to meet you!'
      + '\n\nYou can control me by sending these commands:\n\n'
      + `${(() => {
        let stringToAdd = '';
        commandsList.forEach(({ command, description }) => {
          stringToAdd += `/${command}: ${description}\n`;
        });
        return stringToAdd;
      })()}`,
  );
};

const { InlineKeyboard } = require('grammy');

module.exports.buildButtonFunction = (valuesArr) => () => {
  const buttons = new InlineKeyboard();
  valuesArr.forEach(([key, title]) => {
    buttons.text(title, key).row();
  });
  return buttons;
};

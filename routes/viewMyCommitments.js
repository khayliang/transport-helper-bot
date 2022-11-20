const moment = require('moment-timezone');

const { commitmentsEnum } = require('../enums/commitmentsEnum');

const getMyCommitments = async () => [
  {
    commitmentType: 'overseas_leave',
    startTimestamp: 12335235234,
    endTimestamp: 5623452345325,
    location: 'nepal',
    purpose: 'nil',
  },
  {
    commitmentType: 'ma',
    startTimestamp: 12335235234,
    endTimestamp: 5623452345325,
    location: 'cgh',
    purpose: 'medical review for back',
  },
  {
    commitmentType: 'leave',
    startTimestamp: 12335235234,
    endTimestamp: 5623452345325,
    location: 'nil',
    purpose: 'nil',
  },
];

module.exports.viewMyCommitments = async (ctx) => {
  try {
    const myCommitments = await getMyCommitments();
    let msgToSend = '';
    myCommitments.forEach(({
      commitmentType, startTimestamp, endTimestamp, location, purpose,
    }, idx) => {
      const startDate = moment(new Date(startTimestamp));
      const endDate = moment(new Date(endTimestamp));
      msgToSend += `${idx}: ${commitmentsEnum[commitmentType]}${location === 'nil' ? '' : `\nLocation: ${location}`}`
      + `\n ${startDate.format(
        'DD/MM/YYYY',
      )}-${endDate.format('DD/MM/YYYY')} (${endDate.diff(startDate)} days)`
      + `${purpose === 'nil' ? '' : `\n${purpose}`}\n\n`;
    });
    await ctx.reply(`${msgToSend}`);
    ctx.session.route = 'start';
  } catch (err) {
    await ctx.reply(`Error: ${err.message}`);
    ctx.session.route = 'start';
  }
};

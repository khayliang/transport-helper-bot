const { default: axios } = require('axios');
const snakeize = require('snakeize');
const { api } = require('./api');

const addr = api.createNewActivity;

module.exports.createNewActivity = async (activityData) => {
  const resp = await axios.post(addr, snakeize(activityData));
  return resp;
};

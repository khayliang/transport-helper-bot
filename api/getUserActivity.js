const { default: axios } = require('axios');
const camelize = require('camelize');
const snakeize = require('snakeize');
const { api } = require('./api');

const addr = api.getUserActivity;

module.exports.getUserActivity = async (params) => {
  try {
    const snakeizedParams = snakeize(params);
    const { data: activities } = await axios.get(addr, {
      params: snakeizedParams,
    });
    return camelize(activities);
  } catch (err) {
    throw (new Error(JSON.stringify(err.response.data)));
  }
};

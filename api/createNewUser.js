const { default: axios } = require('axios');
const snakeize = require('snakeize');
const { api } = require('./api');

const addr = api.createNewUser;

module.exports.createNewUser = async (userData) => {
  const resp = await axios.post(addr, snakeize(userData));
  return resp;
};

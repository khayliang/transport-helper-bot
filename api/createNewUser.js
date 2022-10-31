const { default: axios } = require('axios');
const snakeize = require('snakeize');
const { api } = require('./api');

const addr = api.createNewUser;

module.exports.createNewUser = async (userData) => {
  try {
    const resp = await axios.post(addr, snakeize(userData));
    return resp;
  } catch (err) {
    throw (new Error(err.response.data));
  }
};

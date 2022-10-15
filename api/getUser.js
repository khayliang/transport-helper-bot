const { default: axios } = require('axios');
const camelize = require('camelize');
const { api } = require('./api');

const addr = api.getUser;

module.exports.getUser = async (userId) => {
  const { data } = await axios.get(addr, {
    params: {
      telegram_id: userId,
    },
  });
  return camelize(data);
};

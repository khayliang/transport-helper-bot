const { default: axios } = require('axios');
const camelize = require('camelize');
const { api } = require('./api');

const addr = api.getUsersInUnit;

module.exports.getUsersInUnit = async ({ armyUnit }) => {
  const {
    data: { Items },
  } = await axios.get(addr, {
    params: { army_unit: armyUnit },
  });
  return camelize(Items);
};

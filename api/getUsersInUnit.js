const { default: axios } = require('axios');
const camelize = require('camelize');
const { api } = require('./api');

const addr = api.getUsersInUnit;

module.exports.getUsersInUnit = async ({ armyUnit }) => {
  try {
    const {
      data: { Items },
    } = await axios.get(addr, {
      params: { army_unit: armyUnit },
    });
    return camelize(Items);
  } catch (err) {
    throw (new Error(err.response.data));
  }
};

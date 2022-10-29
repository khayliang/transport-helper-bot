const { default: axios } = require('axios');
const snakeize = require('snakeize');
const { api } = require('./api');

const addr = api.registerVehicle;

module.exports.registerVehicle = async (vehicleData) => {
  try {
    const resp = await axios.post(addr, snakeize(vehicleData));
    return resp;
  } catch (err) {
    throw (new Error(err.response.data));
  }
};

const { default: axios } = require('axios');
const snakeize = require('snakeize');
const { api } = require('./api');

const addr = api.registerVehicle;

module.exports.registerVehicle = async (vehicleData) => {
  const resp = await axios.post(addr, snakeize(vehicleData));
  return resp;
};

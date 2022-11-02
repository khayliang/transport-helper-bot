const { default: axios } = require('axios');
const camelize = require('camelize');
const { api } = require('./api');

const addr = api.getVehicle;

module.exports.getVehicle = async (vehicleNo) => {
  try {
    const { data } = await axios.get(addr, {
      params: {
        vehicle_no: vehicleNo,
      },
    });
    return camelize(data);
  } catch (err) {
    throw (new Error(JSON.stringify(err.response.data)));
  }
};

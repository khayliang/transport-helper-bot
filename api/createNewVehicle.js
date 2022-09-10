const { default: axios } = require("axios");
const { api } = require("./api");

const addr = api.createNewVehicle;

module.exports.createNewVehicle = async (vehicleData) => {
  const resp = await axios.post(addr, vehicleData);
  return resp;
};

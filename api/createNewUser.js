const { default: axios } = require("axios");
const { api } = require("./api");

const addr = api.createNewUser;

module.exports.createNewUser = async (userData) => {
  const resp = await axios.post(addr, userData);
  return resp;
};

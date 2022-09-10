const { default: axios } = require("axios");
const { api } = require("./api");

const addr = api.createNewActivity;

module.exports.createNewActivity = async (activityData) => {
  const resp = await axios.post(addr, activityData);
  return resp;
};

const { default: axios } = require("axios");
const { api } = require("./api");

const addr = api.getUserActivity;

module.exports.getUserActivity = async (params) => {
  try {
    const { data: activities } = await axios.get(addr, {
      params: params,
    });
    return activities;
  } catch (err) {
    console.log(err);
    console.log(err.message);
  }
};

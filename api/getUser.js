const { default: axios } = require("axios");
const { api } = require("./api");

const addr = api.getUser;

module.exports.getUser = async (userId) => {
  try {
    const { data } = await axios.get(addr, {
      params: {
        telegram_id: userId,
      },
    });
    return data;
  } catch (err) {
    console.log(err.message);
  }
};

const { default: axios } = require("axios");
const { api } = require("./api");

const addr = api.getUsersInUnit;

module.exports.getUsersInUnit = async ({ army_unit }) => {
  try {
    const {
      data: { Items },
    } = await axios.get(addr, {
      params: { army_unit },
    });
    return Items;
  } catch (err) {
    console.log(err);
    console.log(err.message);
  }
};

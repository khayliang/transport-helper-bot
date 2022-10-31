const { default: axios } = require('axios');
const camelize = require('camelize');
const { api } = require('./api');

const addr = api.getWptListForNode;

module.exports.getWptListForNode = async ({ node }) => {
  try {
    const { data } = await axios.get(addr, {
      params: { node },
    });
    return camelize(data);
  } catch (err) {
    throw (new Error(err.response.data));
  }
};

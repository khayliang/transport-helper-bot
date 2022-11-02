const { default: axios } = require('axios');

axios.defaults.headers['X-API-KEY'] = process.env.API_KEY;

const url = process.env.API_URL;

module.exports.api = {
  createNewActivity: `${url}/create_new_activity`,
  createNewUser: `${url}/create_new_user`,
  registerVehicle: `${url}/register_vehicle`,
  getUser: `${url}/get_user`,
  getUserActivity: `${url}/get_user_activity_of_month`,
  getUsersInUnit: `${url}/get_users_in_army_unit`,
  getWptListForNode: `${url}/get_wpt_list_for_node`,
  getVehicle: `${url}/get_vehicle`
};

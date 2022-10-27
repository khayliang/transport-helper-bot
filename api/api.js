let url = process.env.API_URL;

module.exports.api = {
  createNewActivity: `${url}/create_new_activity`,
  createNewUser: `${url}/create_new_user`,
  createNewVehicle: `${url}/create_new_vehicle`,
  getUser: `${url}/get_user`,
  getUserActivity: `${url}/get_user_activity_of_month`,
  getUsersInUnit: `${url}/get_users_in_army_unit`,
};

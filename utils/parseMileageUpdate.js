/* eslint no-restricted-globals: 0 */
const moment = require('moment-timezone');

const parseValues = [
  {
    key: 'purpose',
  },
  {
    key: 'vehicleNo',
    parse: (val) => {
      if (isNaN(val)) throw Error('invalid vehicle no');
      else return parseInt(val, 10);
    },
  },
  {
    key: 'ivcWorking',
    parse: (val) => (!!['yes', 'y'].includes(val)),
  },
  {
    key: 'initialDestination',
  },
  {
    key: 'initialTimestamp',
    parse: (val) => {
      const dateTime = val.split(' ').filter((el) => el != null);
      const time = moment(dateTime[0], 'DDMMYY/HHmm', true);
      if (time.isValid()) return time.valueOf();
      throw Error('Invalid starting time format');
    },
  },
  {
    key: 'initialMileage',
    parse: (val) => {
      if (isNaN(val)) throw Error('invalid starting odometer');
      else return parseInt(val, 10);
    },
  },
  {
    key: 'finalDestination',
  },
  {
    key: 'finalTimestamp',
    parse: (val) => {
      const dateTime = val.split(' ').filter((el) => el != null);
      const time = moment(dateTime[0], 'DDMMYY/HHmm', true);
      if (time.isValid()) return time.valueOf();
      throw Error('Invalid starting time format');
    },
  },
  {
    key: 'finalMileage',
    parse: (val) => {
      if (isNaN(val)) throw Error('invalid end odometer');
      else return parseInt(val, 10);
    },
  },
  {
    key: 'polAmt',
    parse: (val) => {
      if (val === 'nil') return -1;
      if (isNaN(val)) throw Error('invalid pol amount');
      else return parseInt(val, 10);
    },
  },
  {
    key: 'polOdo',
    parse: (val) => {
      if (val === 'nil') return -1;
      if (isNaN(val)) throw Error('invalid pol odometer');
      else return parseInt(val, 10);
    },
  },
];

module.exports.parseMileageUpdate = (msg) => {
  const valuesArr = msg.toLowerCase().split(/\r?\n/).map(((str) => str.split(':')[1])).slice(2);
  if (valuesArr.length < 11) throw Error('Missing values in the message!');
  const activityObj = {};
  valuesArr.forEach((val, idx) => {
    const { key, parse = (x) => x } = parseValues[idx];
    activityObj[key] = parse(val.trim());
  });

  return activityObj;
};

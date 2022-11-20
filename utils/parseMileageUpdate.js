const moment = require('moment-timezone');

const parseValues = [
  {
    key: 'purpose',
  },
  {
    key: 'vehicleNo',
    parse: (val) => {
      if (Number.isNaN(val)) throw Error('invalid vehicle no');
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
      if (Number.isNaN(val)) throw Error('invalid starting odometer');
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
      if (Number.isNaN(val)) throw Error('invalid end odometer');
      else return parseInt(val, 10);
    },
  },
  {
    key: 'polAmt',
    parse: (val) => {
      if (val === 'nil') return 0;
      if (Number.isNaN(val)) throw Error('invalid pol amount');
      else return parseInt(val, 10);
    },
  },
  {
    key: 'polOdo',
    parse: (val) => {
      if (val === 'nil') return 0;
      if (Number.isNaN(val)) throw Error('invalid pol odometer');
      else return parseInt(val, 10);
    },
  },
];

module.exports.parseMileageUpdate = (msg) => {
  const valuesArr = msg.toLowerCase().split(/\r?\n/).map(((str) => str.split(': ')[1])).slice(2);
  // console.log(valuesArr)
  const activityObj = {};
  valuesArr.forEach((val, idx) => {
    const { key, parse = (x) => x } = parseValues[idx];
    activityObj[key] = parse(val);
  });
  // console.log(activityObj)

  return activityObj;
};

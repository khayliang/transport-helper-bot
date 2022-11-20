const { parseMileageUpdate } = require('./parseMileageUpdate');

const mileageUpdateText = `Rank / Name : 3SG BRYAN
Mask NRIC: TXXXX012A
Purpose: SHIFT VEHICLE
Vehicle No: 12345
IVC working: Yes
Starting destination: Bedok Camp
Date/Time start: 181122/0415
Start Odo: 38302
End destination: Bedok Camp
Date/Time end: 181122/1635
End Odo: 38305
Pol Amt: nil
Pol Odo: nil`;

test('function parses message text into activity object', async () => {
  const parsedMsg = parseMileageUpdate(mileageUpdateText);
  expect(parsedMsg).toEqual({
    purpose: 'shift vehicle',
    vehicleNo: 12345,
    ivcWorking: true,
    initialDestination: 'bedok camp',
    finalDestination: 'bedok camp',
    initialTimestamp: 1668716100000,
    finalTimestamp: 1668760500000,
    initialMileage: 38302,
    finalMileage: 38305,
    polAmt: 0,
    polOdo: 0,
  });
});

const mileageUpdateTextNoIvc = `Rank / Name : 3SG BRYAN
Mask NRIC: TXXXX012A
Purpose: SHIFT VEHICLE
Vehicle No: 12345
IVC working: no
Starting destination: Bedok Camp
Date/Time start: 181122/0415
Start Odo: 38302
End destination: Bedok Camp
Date/Time end: 181122/1635
End Odo: 38305
Pol Amt: nil
Pol Odo: nil`;

test('ivc value works', async () => {
  const parsedMsg = parseMileageUpdate(mileageUpdateTextNoIvc);
  expect(parsedMsg).toEqual({
    purpose: 'shift vehicle',
    vehicleNo: 12345,
    ivcWorking: false,
    initialDestination: 'bedok camp',
    finalDestination: 'bedok camp',
    initialTimestamp: 1668716100000,
    finalTimestamp: 1668760500000,
    initialMileage: 38302,
    finalMileage: 38305,
    polAmt: 0,
    polOdo: 0,
  });
});

const mileageUpdateTextInvalidTime = `Rank / Name : 3SG BRYAN
Mask NRIC: TXXXX012A
Purpose: SHIFT VEHICLE
Vehicle No: 12345
IVC working: no
Starting destination: Bedok Camp
Date/Time start: 181122 1635
Start Odo: 38302
End destination: Bedok Camp
Date/Time end: 181122/1635
End Odo: 38305
Pol Amt: nil
Pol Odo: nil`;

test('invalid time format throws error', async () => {
  expect(() => {
    parseMileageUpdate(mileageUpdateTextInvalidTime);
  }).toThrow();
});

const invalidVehicleNo = `Rank / Name : 3SG BRYAN
Mask NRIC: TXXXX012A
Purpose: SHIFT VEHICLE
Vehicle No: 1aa44
IVC working: no
Starting destination: Bedok Camp
Date/Time start: 181122/1635
Start Odo: 38302
End destination: Bedok Camp
Date/Time end: 181122/1635
End Odo: 38305
Pol Amt: nil
Pol Odo: nil`;

test('invalid vehicle number throws error', async () => {
  expect(() => {
    parseMileageUpdate(invalidVehicleNo);
  }).toThrow();
});

const polUpdate = `Rank / Name : 3SG BRYAN
Mask NRIC: TXXXX012A
Purpose: SHIFT VEHICLE
Vehicle No: 12345
IVC working: no
Starting destination: Bedok Camp
Date/Time start: 181122/0415
Start Odo: 38302
End destination: Bedok Camp
Date/Time end: 181122/1635
End Odo: 38305
Pol Amt: 1233
Pol Odo: 23333`;

test('POL works', async () => {
  const parsedMsg = parseMileageUpdate(polUpdate);
  expect(parsedMsg).toEqual({
    purpose: 'shift vehicle',
    vehicleNo: 12345,
    ivcWorking: false,
    initialDestination: 'bedok camp',
    finalDestination: 'bedok camp',
    initialTimestamp: 1668716100000,
    finalTimestamp: 1668760500000,
    initialMileage: 38302,
    finalMileage: 38305,
    polAmt: 1233,
    polOdo: 23333,
  });
});

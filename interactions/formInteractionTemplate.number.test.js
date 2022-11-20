const { formInteractionTemplate } = require('./formInteractionTemplate');

afterEach(() => {
  jest.clearAllMocks();
});

const numberTestForm = {
  entries: [
    {
      key: 'number',
      title: 'number_entry',
      type: 'number',
      verify: jest.fn(() => false),
      display: jest.fn(() => 'data'),
      prompt: jest.fn(() => 'prompt'),
      success: jest.fn(() => 'success'),
      error: jest.fn(() => 'error'),
    },
  ],
  onStart: jest.fn(() => 'start'),
  onFinish: jest.fn(async () => 'finish'),
};

const numberTestCtx = {
  session: {
    step: 0,
    data: {},
    user: {},
  },
  from: {
    id: 1234,
  },
  reply: jest.fn(() => 'reply'),
  message: { text: '3' },
};

test('For number type entry, if verify function is false, step remains the same', async () => {
  await formInteractionTemplate(numberTestCtx, numberTestForm);
  expect(numberTestCtx.session.step).toBe(0);
});

test('For number type entry, verify function is called and recieves correct object', async () => {
  const { entries } = numberTestForm;
  const numberEntry = entries[0];
  await formInteractionTemplate(numberTestCtx, numberTestForm);
  expect(numberEntry.verify.mock.calls).toHaveLength(1);
  expect(numberEntry.verify.mock.calls[0][0]).toEqual({ ctx: numberTestCtx, data: 3 });
});

test('For number type entry, if verify is false, error function is called and recieves correct object', async () => {
  const { entries } = numberTestForm;
  const numberEntry = entries[0];
  await formInteractionTemplate(numberTestCtx, numberTestForm);
  expect(numberEntry.error.mock.calls).toHaveLength(1);
  expect(numberEntry.error.mock.calls[0][0]).toEqual({ ctx: numberTestCtx, data: 3 });
});

test('For number type entry, if verify function is false, prompt is sent again', async () => {
  const { entries } = numberTestForm;
  const numberEntry = entries[0];
  await formInteractionTemplate(numberTestCtx, numberTestForm);
  expect(numberEntry.prompt.mock.calls).toHaveLength(1);
});

test('For number type entry, if data isnt a number, error function is called', async () => {
  const workingNumberTestForm = {
    entries: [
      {
        key: 'number',
        title: 'number_entry',
        type: 'number',
        verify: jest.fn(() => true),
        display: jest.fn(() => 'data'),
        prompt: jest.fn(() => 'prompt'),
        success: jest.fn(() => 'success'),
        error: jest.fn(() => 'error'),
      },
    ],
    onStart: jest.fn(() => 'start'),
    onFinish: jest.fn(async () => 'finish'),
  };
  const wrongNumberTestCtx = {
    session: {
      step: 0,
      data: {},
      user: {},
    },
    from: {
      id: 1234,
    },
    reply: jest.fn(() => 'reply'),
    message: { text: 'text' },
  };

  const { entries } = workingNumberTestForm;
  const numberEntry = entries[0];
  await formInteractionTemplate(wrongNumberTestCtx, workingNumberTestForm);
  expect(numberEntry.error.mock.calls).toHaveLength(1);
});

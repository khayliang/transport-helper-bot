const { formInteractionTemplate } = require('./formInteractionTemplate');

afterEach(() => {
  jest.clearAllMocks();
});

const stringTestForm = {
  entries: [
    {
      key: 'string',
      title: 'string_entry',
      type: 'string',
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

const stringTestCtx = {
  session: {
    step: 0,
    data: {},
    user: {},
  },
  from: {
    id: 1234,
  },
  reply: jest.fn(() => 'reply'),
  message: { text: 'message text' },
};

test('For string type entry, if verify function is false, step remains the same', async () => {
  await formInteractionTemplate(stringTestCtx, stringTestForm);
  expect(stringTestCtx.session.step).toBe(0);
});

test('For string type entry, verify function is called and recieves correct object', async () => {
  const { entries } = stringTestForm;
  const stringEntry = entries[0];
  await formInteractionTemplate(stringTestCtx, stringTestForm);
  expect(stringEntry.verify.mock.calls).toHaveLength(1);
  expect(stringEntry.verify.mock.calls[0][0]).toEqual({ ctx: stringTestCtx, data: 'message text' });
});

test('For string type entry, error function is called and recieves correct object', async () => {
  const { entries } = stringTestForm;
  const stringEntry = entries[0];
  await formInteractionTemplate(stringTestCtx, stringTestForm);
  expect(stringEntry.error.mock.calls).toHaveLength(1);
  expect(stringEntry.error.mock.calls[0][0]).toEqual({ ctx: stringTestCtx, data: 'message text' });
});

test('For string type entry, if verify function is false, prompt is sent again', async () => {
  const { entries } = stringTestForm;
  const stringEntry = entries[0];
  await formInteractionTemplate(stringTestCtx, stringTestForm);
  expect(stringEntry.prompt.mock.calls).toHaveLength(1);
});

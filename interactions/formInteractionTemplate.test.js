const { buildButtonFunction } = require('../utils/buildButtonFunction');
const { formInteractionTemplate } = require('./formInteractionTemplate');

const testForm = {
  entries: [
    {
      key: 'string',
      title: 'string_entry',
      type: 'string',
      verify: jest.fn(() => true),
      display: jest.fn(() => 'data'),
      prompt: jest.fn(() => 'prompt'),
      success: jest.fn(() => 'success'),
      error: jest.fn(() => 'error'),
    },
    {
      key: 'buttons',
      title: 'buttons_entry',
      type: 'buttons',
      buttons: buildButtonFunction(Object.entries({ b1: 'button_one', b2: 'button_two' })),
      verify: jest.fn(() => true),
      display: jest.fn(() => 'data'),
      prompt: jest.fn(() => 'prompt'),
      success: jest.fn(() => 'success'),
      error: jest.fn(() => 'error'),
    },
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

afterEach(() => {
  jest.clearAllMocks();
});

test('if session step is idle, onStart must run, first entry must be prompted, and step should be 0', async () => {
  const idleCtx = {
    session: {
      step: 'idle',
      data: {},
      user: {},
    },
    callbackQuery: {
      data: 'data',
    },
    from: {
      id: 1234,
    },
    reply: jest.fn(() => 'reply'),
    message: { text: 'message text' },

  };
  await formInteractionTemplate(idleCtx, testForm);
  const { entries, onStart } = testForm;
  expect(onStart.mock.calls).toHaveLength(1);
  expect(onStart.mock.calls[0][0]).toBe(idleCtx);
  expect(entries[0].prompt.mock.calls).toHaveLength(1);
  expect(idleCtx.session.step).toBe(0);
});

test('if session step is n, after submitting valid response, step should be n+1', async () => {
  const ctx = {
    session: {
      step: 0,
      data: {},
      user: {},
    },
    callbackQuery: {
      data: 'data',
    },
    from: {
      id: 1234,
    },
    reply: jest.fn(() => 'reply'),
    message: { text: 'message text' },

  };
  await formInteractionTemplate(ctx, testForm);
  expect(ctx.session.step).toBe(1);
  await formInteractionTemplate(ctx, testForm);
  expect(ctx.session.step).toBe(2);
});

test('After submitting valid response, the next prompt is sent', async () => {
  const ctx = {
    session: {
      step: 0,
      data: {},
      user: {},
    },
    callbackQuery: {
      data: 'data',
    },
    from: {
      id: 1234,
    },
    reply: jest.fn(() => 'reply'),
    message: { text: 'message text' },

  };
  const { entries } = testForm;
  await formInteractionTemplate(ctx, testForm);
  expect(entries[1].prompt.mock.calls).toHaveLength(1);
  await formInteractionTemplate(ctx, testForm);
  expect(entries[2].prompt.mock.calls).toHaveLength(1);
});

test('if session is at final step, after submitting valid response, step should be n+1', async () => {
  const ctx = {
    session: {
      step: 0,
      data: {},
      user: {},
    },
    callbackQuery: {
      data: 'data',
    },
    from: {
      id: 1234,
    },
    reply: jest.fn(() => 'reply'),
    message: { text: 'message text' },

  };
  await formInteractionTemplate(ctx, testForm);
  expect(ctx.session.step).toBe(1);
  await formInteractionTemplate(ctx, testForm);
  expect(ctx.session.step).toBe(2);
});

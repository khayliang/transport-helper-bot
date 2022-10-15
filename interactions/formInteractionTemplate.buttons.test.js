const { buildButtonFunction } = require('../utils/buildButtonFunction');
const { formInteractionTemplate } = require('./formInteractionTemplate');

afterEach(() => {
  jest.clearAllMocks();
});

const buttonsTestForm = {
  entries: [
    {
      key: 'buttons',
      title: 'buttons_entry',
      type: 'buttons',
      buttons: buildButtonFunction(Object.entries({ b1: 'button_one', b2: 'button_two' })),
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

const buttonsTestCtx = {
  session: {
    step: 0,
    data: {},
    user: {},
  },
  callbackQuery: {
    data: 'b1',
  },
  from: {
    id: 1234,
  },
  reply: jest.fn(() => 'reply'),
  message: { text: '3' },
};

test('For button type entry, if verify function is false, step remains the same', async () => {
  await formInteractionTemplate(buttonsTestCtx, buttonsTestForm);
  expect(buttonsTestCtx.session.step).toBe(0);
});

test('For button type entry, verify function is called and recieves correct object', async () => {
  const { entries } = buttonsTestForm;
  const buttonEntry = entries[0];
  await formInteractionTemplate(buttonsTestCtx, buttonsTestForm);
  expect(buttonEntry.verify.mock.calls).toHaveLength(1);
  expect(buttonEntry.verify.mock.calls[0][0]).toEqual({ ctx: buttonsTestCtx, data: 'b1' });
});

test('For button type entry, if verify is false, error msg and prompt is sent and recieves correct object', async () => {
  const { entries } = buttonsTestForm;
  const buttonEntry = entries[0];
  const replyMock = buttonsTestCtx.reply;
  await formInteractionTemplate(buttonsTestCtx, buttonsTestForm);
  expect(buttonEntry.error.mock.calls).toHaveLength(1);
  expect(replyMock.mock.calls).toHaveLength(2);
  expect(buttonEntry.error.mock.calls[0][0]).toEqual({ ctx: buttonsTestCtx, data: 'b1' });
});

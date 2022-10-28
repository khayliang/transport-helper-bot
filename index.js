require('dotenv').config();

const { Bot, session } = require('grammy');
const { Router } = require('@grammyjs/router');
const { limit } = require('@grammyjs/ratelimiter');

const { startRoute } = require('./routes/startRoute');
const { registerVehicleRoute } = require('./routes/registerVehicleRoute');
const { createAccountRoute } = require('./routes/createAccountRoute');
const { endInteraction } = require('./interactions/endInteraction');
const { addActivityRoute } = require('./routes/addActivityRoute');
const { viewMyMileageRoute } = require('./routes/viewMyMileageRoute');
const { viewMyActivitiesRoute } = require('./routes/viewMyActivitiesRoute');
const {
  viewPersonnelMileageRoute,
} = require('./routes/viewPersonnelMileageRoute');

const { getUser } = require('./api/getUser');

const { commandsList } = require('./enums/commandsList');
const { viewMyWptListRoute } = require('./routes/viewMyWptListRoute');
const { apiThrottler } = require('@grammyjs/transformer-throttler');
const { run, sequentialize } = require('@grammyjs/runner');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const getSessionKey = (ctx) => {
  return ctx.chat?.id.toString();
}
bot.use(sequentialize(getSessionKey));
bot.use(
  session({
    getSessionKey,
    initial: () => ({
      user: null,
      route: 'start',
      step: 'idle',
      data: {},
      locked: false,
    }),
  }),
);
bot.use(limit({ timeFrame: 2000 }));

bot.api.config.use(apiThrottler())

bot.api.setMyCommands(commandsList);

const router = new Router(async (ctx) => {
  const currentRoute = ctx.session.route;
  if (!ctx.session.user && currentRoute !== 'create_account') {
    try {
      const userData = await getUser(ctx.from.id);
      if (!userData) {
        ctx.session.route = 'create_account';
        return 'create_account';
      }
      ctx.session.user = userData;
    } catch (err) {
      await ctx.reply(`Whoops! Something seems to have went wrong: ${err.message}`);
    }
  }
  if (ctx.hasCommand('start')) {
    await endInteraction(ctx);
    ctx.session.route = 'start';
    return 'start';
  } if (ctx.hasCommand('create_account')) {
    await endInteraction(ctx);
    ctx.session.route = 'create_account';
    return 'create_account';
  } if (ctx.hasCommand('register_vehicle')) {
    await endInteraction(ctx);
    ctx.session.route = 'register_vehicle';
    return 'register_vehicle';
  } if (ctx.hasCommand('view_my_mileage')) {
    await endInteraction(ctx);
    ctx.session.route = 'view_my_mileage';
    return 'view_my_mileage';
  } if (ctx.hasCommand('view_my_activities')) {
    await endInteraction(ctx);
    ctx.session.route = 'view_my_activities';
    return 'view_my_activities';
  } if (ctx.hasCommand('view_personnel_mileage')) {
    await endInteraction(ctx);
    ctx.session.route = 'view_personnel_mileage';
    return 'view_personnel_mileage';
  } if (ctx.hasCommand('add_activity')) {
    await endInteraction(ctx);
    ctx.session.route = 'add_activity';
    return 'add_activity';
  } if (ctx.hasCommand('view_my_wpt_list')) {
    await endInteraction(ctx);
    ctx.session.route = 'view_my_wpt_list';
    return 'view_my_wpt_list';
  }
  return currentRoute;
});

router.route('start', startRoute);
router.route('register_vehicle', registerVehicleRoute);
router.route('create_account', createAccountRoute);
router.route('add_activity', addActivityRoute);
router.route('view_my_mileage', viewMyMileageRoute);
router.route('view_my_activities', viewMyActivitiesRoute);
router.route('view_personnel_mileage', viewPersonnelMileageRoute);
router.route('view_my_wpt_list', viewMyWptListRoute);
router.otherwise(async (ctx) => {
  ctx.session.route = 'start';
  await ctx.reply('Whoops! Something seems to have went wrong.');
});
bot.use(router);

const runner = run(bot);

const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);

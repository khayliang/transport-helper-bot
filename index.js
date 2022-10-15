require('dotenv').config();

const { Bot, session } = require('grammy');
const { Router } = require('@grammyjs/router');
const { limit } = require('@grammyjs/ratelimiter');

const { startRoute } = require('./routes/startRoute');
const { addVehicleRoute } = require('./routes/addVehicleRoute');
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

const bot = new Bot(process.env.TOKEN_DEV);

bot.use(
  session({
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
  } if (ctx.hasCommand('add_vehicle')) {
    await endInteraction(ctx);
    ctx.session.route = 'add_vehicle';
    return 'add_vehicle';
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
  }
  return currentRoute;
});

router.route('start', startRoute);
router.route('add_vehicle', addVehicleRoute);
router.route('create_account', createAccountRoute);
router.route('add_activity', addActivityRoute);
router.route('view_my_mileage', viewMyMileageRoute);
router.route('view_my_activities', viewMyActivitiesRoute);
router.route('view_personnel_mileage', viewPersonnelMileageRoute);
router.otherwise(async (ctx) => {
  ctx.session.route = 'start';
  await ctx.reply('Whoops! Something seems to have went wrong.');
});
bot.use(router);
bot.start();

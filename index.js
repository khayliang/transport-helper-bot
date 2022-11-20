require('dotenv').config();

const http = require('node:http');

const moment = require('moment-timezone');

const { Bot, session } = require('grammy');
const { Router } = require('@grammyjs/router');
const { limit } = require('@grammyjs/ratelimiter');
const { apiThrottler } = require('@grammyjs/transformer-throttler');
const { run, sequentialize } = require('@grammyjs/runner');
const {
  conversations,
  createConversation,
} = require('@grammyjs/conversations');

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
const { feedbackRoute } = require('./routes/feedbackRoute');
const { getVehicleRoute } = require('./routes/getVehicleRoute');

const { getUser } = require('./api/getUser');

const { commandsList } = require('./enums/commandsList');
const { viewMyWptListRoute } = require('./routes/viewMyWptListRoute');
const { getMileageUpdateConvo } = require('./conversations/getMileageUpdateConvo');
const { addMileageUpdateRoute } = require('./routes/addMileageUpdateRoute');

moment.tz.setDefault('Asia/Singapore');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const getSessionKey = (ctx) => ctx.chat?.id.toString();
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

bot.api.config.use(apiThrottler());

bot.api.setMyCommands(commandsList);

bot.use(conversations());
bot.use(createConversation(getMileageUpdateConvo, 'getMileageUpdateConvo'));

bot.catch(async (err) => {
  const { ctx } = err;
  await ctx.reply(err.message);
  await endInteraction(ctx);
  await startRoute(ctx);
});

const router = new Router(async (ctx) => {
  const currentRoute = ctx.session.route;
  if (!ctx.session.user) {
    if (currentRoute !== 'create_account') {
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
    } else {
      // prevent access to other routes if account isn't created yet
      if (ctx.has('msg:entities:bot_command')) {
        await ctx.reply('Hey! Your account isn\'t created yet. Let\'s go create a new account');
        await endInteraction(ctx);
        ctx.session.route = 'create_account';
      }
      return currentRoute;
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
  } if (ctx.hasCommand('give_feedback')) {
    await endInteraction(ctx);
    ctx.session.route = 'give_feedback';
    return 'give_feedback';
  } if (ctx.hasCommand('get_vehicle')) {
    await endInteraction(ctx);
    ctx.session.route = 'get_vehicle';
    return 'get_vehicle';
  } if (ctx.hasCommand('add_mileage_msg')) {
    await endInteraction(ctx);
    ctx.session.route = 'add_mileage_msg';
    return 'add_mileage_msg';
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
router.route('give_feedback', feedbackRoute);
router.route('get_vehicle', getVehicleRoute);
router.route('add_mileage_msg', addMileageUpdateRoute);

router.otherwise(async (ctx) => {
  ctx.session.route = 'start';
  await ctx.reply('Whoops! Something seems to have went wrong.');
});
bot.use(router);

const runner = run(bot);

const srvr = http.createServer((_, res) => {
  res.writeHead(200);
  res.end('I\'m running!');
}).listen(8080);

const stopRunner = async (err) => {
  await runner.stop();
  await srvr.close();
  process.exit(err ? 1 : 0);
};
process.on('SIGINT', stopRunner);
process.on('SIGTERM', stopRunner);
process.on('SIGQUIT', stopRunner);

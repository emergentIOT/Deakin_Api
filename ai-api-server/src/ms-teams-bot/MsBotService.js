// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required pckages
const path = require('path');
const utils = require('du-utils').UtilGeneral();


// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter } = require('botbuilder');

const { TeamsConversationBot } = require('./bots/teamsConversationBot');

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: utils.getConfig('MICROSOFT_APP_ID'),
    appPassword: utils.getConfig('MICROSOFT_APP_PASSWORD')
});

adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights. See https://aka.ms/bottelemetry for telemetry 
    //       configuration instructions.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Create the bot that will handle incoming messages.
const bot = new TeamsConversationBot();

// Create HTTP server.
// const server = restify.createServer();
// server.listen(process.env.port || process.env.PORT || 3978, function() {
//     console.log(`\n${ server.name } listening to ${ server.url }`);
// });

exports.installWs = function(server) {
    // Listen for incoming requests.
    server.post(server.getPath('/ms-bot/messages'), (req, res) => {
        console.log(JSON.stringify(req.headers));
        adapter.processActivity(req, res, async (context) => {
            await bot.run(context);
        });
    });

};
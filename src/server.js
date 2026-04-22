'use strict';

import { CronJob } from "cron";
import app from './app.js';
import sendMessage from "./utilities/sendMessage.js";
import composeLunchListMessage from "./utilities/formatters/lunchFormatter.js";
import composeWinnerMessage from "./utilities/formatters/winnerMessage.js";
import composeOrderMessage from "./utilities/formatters/orderMessage.js"
import getOffersList from "./voting_start/getOffersList.js";
import saveOffers from "./voting_start/saveOffers.js";
import calculateWinner from "./voting_end/calculateWinner.js";
import getChosenOffers from "./new_order/getChosenOffers.js";


const fastify = app({
  logger: true,

  // trustProxy: true,
});

// TT:
// It should gather all the lunches from different places. Save all the results to the database one per row.
// It should send all the results to the users in ithe users' list at 9am. Users cannot vote before that.
// Result is numbered sectioned list.
// Try again with another model if it fails. If all fails, tries again after 3 minutes.
// User responds with the numbers. Should accept different numbers divided by .,/\/s. Votes are saved to the database.
// Sends winner at 11.55am. Users cannot vote after that.

// TODO - update for the production
const COMMON_SCHEDULE = "* * mon-fri";
const GATHERING_TIME = "0 10 " + COMMON_SCHEDULE;
const RESULTS_TIME = "30 11 " + COMMON_SCHEDULE;
const ORDER_TIME = "55 11 " + COMMON_SCHEDULE;

try {
  
// add appropriate 'host' parameter
  // fastify.listen({ port: process.env.APP_PORT || 8080, host: '0.0.0.0' });

  // const offersGatheringJob = CronJob.from({
  //   cronTime: GATHERING_TIME,
  //   onTick: async () => {

  //     fastify.log.info("Running offers gathering job");

  //     const offers = await getOffersList(fastify);

  //     if (!offers || offers.length === 0) {

  //       fastify.log.info("No offers found. Nothing to save to the database.");

  //       return;
        
  //     }

  //     await saveOffers(fastify, offers);

  //     const text = composeLunchListMessage(offers);
        
  //     await sendMessage(fastify, text);

  //     fastify.log.info("Lunch menu message sent;");

  //   },

  //   start: true,
  //   timeZone: "Europe/Tallinn",
  //   errorHandler: async (error) => {

  //     fastify.log.error(error);

  //     await sendMessage(fastify, "Oi, miskit läks valesti. Palun proovi uuesti.");

  //   },
  // });

  // const votesSendingJob = CronJob.from({
  //   cronTime: RESULTS_TIME,
  //   onTick: async () => {

  //     fastify.log.info("Running votes gathering job");

  //     const winner = await calculateWinner(fastify);

  //     if (!winner) {

  //       fastify.log.info("Couldn't calculate winner, the message won't be sent");

  //       return;
        
  //     }
      
  //     const text = composeWinnerMessage(winner);

  //     await sendMessage(fastify, text);

  //     fastify.log.info("Winner message sent");

  //   },
  //   start: true,
  //   timeZone: "Europe/Tallinn",
  //   errorHandler: (error) => (fastify.log.error(error)),
  // });

  // const orderSendingJob = CronJob.from({
  //   cronTime: ORDER_TIME,
  //   onTick: async () => {

  //     fastify.log.info("Running order composing job");

  //       const order = await getChosenOffers(fastify);

  //       if (!order) {

  //         fastify.log.info("Couldn't create an order. The message won't be sent.");

  //         return;
          
  //       }

  //       const message = composeOrderMessage(order);

  //       await sendMessage(fastify, message);

  //       fastify.log.info("Order message sent");

  //   },
  //   start: true,
  //   timeZone: "Europe/Tallinn",
  //   errorHandler: (error) => (fastify.log.error(error)),
  // });

} catch (err) {

  fastify.log.error(err);

  process.exit(1);

}

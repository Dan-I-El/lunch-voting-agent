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

// TODO - Change for production

const COMMON_SCHEDULE = "* * 1-5";

const GATHERING_TIME = "20 51 1 " + COMMON_SCHEDULE;
const RESULTS_TIME = "30 5 2 " + COMMON_SCHEDULE;
const ORDER_TIME = "20 14 2 " + COMMON_SCHEDULE;

try {
  
// add appropriate 'host' parameter
  await fastify.listen({ port: 3000, host: '0.0.0.0' });

  const offersGatheringJob = new CronJob(

    // TODO - setup Cron: https://www.npmjs.com/package/cron
    GATHERING_TIME,
    async () => {

      fastify.log.info("Running offers gathering job");

      try {

        const offers = await getOffersList(fastify);

        if (!offers || offers.length === 0) {

          fastify.log.info("No offers found, skipping save and message");

          return;
          
        }

        await saveOffers(fastify, offers);

        const text = composeLunchListMessage(offers);
          
        await sendMessage(fastify, text);

        fastify.log.info("Lunch message sent");

      } catch (error) {

        fastify.log.error(error);

      }

    },
    null,
    true,
    "Europe/Tallinn"
  );

  const votesSendingJob = new CronJob(
    RESULTS_TIME,
    async () => {

      fastify.log.info("Running lunch decision job");

      try {

        const winner = await calculateWinner(fastify);

        const text = composeWinnerMessage(winner);

        await sendMessage(fastify, text);

        fastify.log.info("Winner message sent");

      } catch (error) {

        fastify.log.error(error);
      }

    },
    null,
    true,
    "Europe/Tallinn",
  );

  const orderSendingJob = new CronJob(
    ORDER_TIME,
    async () => {

      fastify.log.info("Running order composing job");

      try {

        const order = await getChosenOffers(fastify);

        const message = composeOrderMessage(order);

        await sendMessage(fastify, message);

        fastify.log.info("Order message sent");

      } catch (error) {

        fastify.log.error(error);
      }

    },
    null,
    true,
    "Europe/Tallinn",
  );

} catch (err) {

  fastify.log.error(err);

  process.exit(1);

}

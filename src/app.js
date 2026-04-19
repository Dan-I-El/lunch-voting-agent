import Fastify from 'fastify';
import dbConnector from './connector.js';
import sendMessage from './utilities/sendMessage.js';
import verifySlackRequest from './utilities/verifySlackRequest.js';
import getTallinnTime from './utilities/getTallinnTime.js';
import parseVoteMessage from './utilities/parser/votes.js';
// import { getOffers } from './jobs/collectOffers.js';


function build(options = {}) {

    const app = Fastify(options);

    app.register(dbConnector).after((error) => {if (error) throw error});

    app.post("/slack/events", async (request, response) => {

        if (request.body.type === 'url_verification') {

            return { challenge: request.body.challenge }

        }

        if (!verifySlackRequest(request)) {

            return response.code(401).send('Invalid signature');
            
        }

        const event = request.body.event;

        if (event.type === 'message' && !event.bot_id) {
            const {
                text,
                user,
                ts,
                thread_ts,
                channel
            } = event;

            console.log({ text, user, channel, ts, thread_ts }, 'Incoming Slack message');

            const now = getTallinnTime();

            const votingEndTime = new Date(now);

            votingEndTime.setHours(11, 55, 0, 0);

            if (now > votingEndTime) {

                await sendMessage(app, "Mu tööpäev on tänaseks lõppenud. Näeme homme! :)");

                return;

            }

            let votes;

            try {

                votes = parseVoteMessage(text);

            } catch (error) {

                app.log.warn({ text, user, error }, 'Vote parse failed');

                await sendMessage(app, "Ma ei saanud su hääletusest aru. Palun saada ainult numbrid, nt 6|7 või 6,7.");

                return;

            }

            const numbers = votes.map(voteNumber => voteNumber[0]);

            const flags = votes.map(voteBulk => voteBulk[1]);

            let client;

            try {

                client = await app.pg.connect();

                const result = await client.query(
                    `
                        INSERT INTO votes (id, person, bulk)
                        SELECT o.id, $3, t.flag
                        FROM offers AS o
                        JOIN unnest($1::int[], $2::boolean[]) AS t(number, flag)
                        ON o.number = t.number
                        WHERE o.created_at::date = CURRENT_DATE
                        RETURNING id;
                    `,
                    [numbers, flags, user]
                );

                if (result.rowCount === 0) {

                    app.log.info("No offers found for today");

                    await sendMessage(app, "Ma ikka magan. Näeme peale 10.");

                    return;
                }

                // for (const vote of votes) {

                //     await client.query(`
                //         WITH offer_id AS (
                //             SELECT id FROM offers WHERE number=$1 AND created_at::date = CURRENT_DATE
                //         )
                //         INSERT INTO votes (id, person) SELECT id, $2 FROM offer_id;
                //     `,[vote, user]);

                // }
                
                app.log.info(`Saved ${votes.length} votes`);

            } catch (error) {

                app.log.error(error);

                await sendMessage(app, "Oi, tekkis viga su hääle salvestamisel. Palun proovi uuesti.");
                
            } finally {
                
                if (client) {

                    client.release();
                
                }
                
            }

        }

        return { status: "ok" };

    });


    return app;

}

export default build;

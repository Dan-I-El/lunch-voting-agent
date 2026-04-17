import Fastify from 'fastify';
import dbConnector from './connector.js';
import sendMessage from './utilities/sendMessage.js';
import verifySlackRequest from './utilities/verifySlackRequest.js';
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

            console.log(`Content: \ntext: ${text}\nuser: ${user}\nts:${ts}\nthreadts: ${thread_ts}\nchannel: ${channel}`);

            // const now = new Date();

            // const votingEndTime = new Date();

            // votingEndTime.setHours(11, 55, 0, 0);

            // if (now > votingEndTime) {

            //     await sendMessage(app, "Sorry, voting has ended for today!");

            // }


            const votes = parseVoteMessage(text);

            let client;

            try {

                client = await app.pg.connect();

                // TODO - handle complex dishes
                const result = await client.query(
                    `
                        INSERT INTO votes (id, person)
                        SELECT id, $2
                        FROM offers
                        WHERE number = ANY($1)
                        AND created_at::date = CURRENT_DATE
                        RETURNING id;
                    `,
                    [votes, user]
                );

                if (result.rowCount === 0) {

                    app.log.info("No offers found for today");

                    return { message: "No offers available today" };
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

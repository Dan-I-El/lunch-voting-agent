import Fastify from 'fastify';
import crypto from 'node:crypto';
import dbConnector from './connector.js';
import parseVoteMessage from './utilities/parser/votes.js';
import verifySlackRequest from './utilities/verifySlackRequest.js';
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

            const votes = parseVoteMessage(text);

            let CLIENT;

            try {

                // TODO - it shold only work if 'offers' table has any offers with the current date. Shouldn't work after 11.55
                CLIENT = await app.pg.connect();
                
                for (const vote of votes) {

                    await CLIENT.query(`
                        WITH offer_id AS (
                            SELECT id FROM offers WHERE number=$1
                        )
                        INSERT INTO votes (id, person) SELECT id, $2 FROM offer_id;
                    `,[vote, user]);

                }
                
                app.log.info(`Saved ${votes.length} votes`);

            } catch (error) {

                app.log.error(error);

                
            } finally {
                
                if (CLIENT) {

                CLIENT.release();
                
                }
                
            }

        }

        return { status: "ok" };

    });


    return app;

}

export default build;

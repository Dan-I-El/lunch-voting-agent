import 'dotenv/config';


const sendMessage = async (fastify, text) => {

  const channel = process.env.CHANNEL;

  try {

    const response = await fetch(
      'https://slack.com/api/chat.postMessage',
      {
        method: "POST",
        body: JSON.stringify({
          channel,
          text,
        }),
        headers: {
          Authorization: `Bearer ${process.env.USER_OAUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      },

    )

    const data = await response.json();

    if (!data.ok) {

      fastify.log.error(data);

      throw new Error(data.error);

    }
    
    return data;

  } catch (error) {

    fastify.log.error(error);
  }
}

export default sendMessage;

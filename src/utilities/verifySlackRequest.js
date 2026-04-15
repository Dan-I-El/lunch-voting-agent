import crypto from 'node:crypto';


const verifySlackRequest = (request) => {

  const timestamp = request.headers['x-slack-request-timestamp'];
  const signature = request.headers['x-slack-signature'];

  const body = JSON.stringify(request.body);

  const baseString = `v0:${timestamp}:${body}`;

  const hmac = crypto.createHmac('sha256', process.env.SIGNING_SECRET).update(baseString).digest('hex');

  const expected = `v0=${hmac}`;

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );

}

export default verifySlackRequest;

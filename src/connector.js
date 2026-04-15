import fastifyPlugin from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';


async function dbConnector(fastify, options) {
    const user = process.env.POSTGRES_USER || 'daniel';
    const password = process.env.POSTGRES_PASSWORD || '';
    const database = process.env.POSTGRES_DB || 'lunch-voting-db';
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = process.env.POSTGRES_PORT || '5432';

    // ADD Roles and RLS
    const connectionString = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;

    await fastify.register(fastifyPostgres, {
        connectionString,
    });
}

export default fastifyPlugin(dbConnector);

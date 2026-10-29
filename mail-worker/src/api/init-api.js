import app from '../hono/hono';
import { dbInit } from '../init/init';

// Setup credentials belong in an Authorization header, never in URLs or logs.
app.post('/init', async (c) => {
    if (!c.env.setup_secret || c.req.header('Authorization') !== `Bearer ${c.env.setup_secret}`) {
        return c.text('Unauthorized', 401);
    }
    return dbInit.init(c);
});

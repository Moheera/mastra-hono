import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { mastra } from './mastra/index.js';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
	dotenv.config({ path: '.env.development' });
} else {
	dotenv.config(); // Loads the default .env file
}

const app = new Hono();

app.get('/', async (c) => {
	return c.text('Hello Hono!');
});

app.get('/weather/:city', async (c)=>{
	const city = c.req.param('city');
	const agent = mastra.getAgent('weatherAgent');
	const result = await agent.stream(`What's the weather like in ${city}?`);
	return c.body(result.textStream);
});

app.get('/planActivities/:city', async (c)=>{
	const JWT = 'some-token';
	const city = c.req.param('city');

	const { runId, start } = mastra.getWorkflow('weatherWorkflow').createRun();
	const runResult = await start({
		triggerData: {city, JWT},
	});

	return c.body(runResult.results['plan-activities']?.output?.activities);
});

serve({
	fetch: app.fetch,
	port: 3000
}, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`);
});
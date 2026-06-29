const http = require('http');
const pool = require('./config/db')
const PORT = 5000;

const getWorkplans = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM workplans');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows)); // Sends back real DB rows
    } catch (err) {
        console.error(err.message);
    }
};

// Helper function to set standard CORS headers to allow your frontend to connect
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const server = http.createServer((req, res) => {
    // 1. Handle CORS Preflight OPTIONS requests (Browsers send this before a POST request)
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(204);
        res.end();
        return;
    }

    // 2. GET Route: Fetch all work plans
    if (req.url === '/api/workplans' && req.method === 'GET') {
        setCorsHeaders(res);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(workPlans));
        return;
    }

    // 3. POST Route: Create a new work plan
    if (req.url === '/api/workplans' && req.method === 'POST') {
        let body = '';

        // Listen for streams of incoming data chunks
        req.on('data', chunk => {
            body += chunk.toString();
        });

        // Once all data chunks are fully received
        req.on('end', () => {
            try {
                const { objective, activity, timeline, status } = JSON.parse(body);

                // Simple validation guard
                if (!objective || !activity || !timeline || !status) {
                    setCorsHeaders(res);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "All fields are required." }));
                    return;
                }

                // Create new work plan object
                const newWorkPlan = {
                    id: workPlans.length + 1,
                    objective,
                    activity,
                    timeline,
                    status
                };

                workPlans.push(newWorkPlan);

                setCorsHeaders(res);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: "Work plan successfully added!",
                    data: newWorkPlan
                }));

            } catch (error) {
                setCorsHeaders(res);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Invalid JSON format received." }));
            }
        });
        return;
    }

    // 4. Catch-all for undefined routes (404 Not Found)
    setCorsHeaders(res);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Route not found." }));
});

const pool = require('../config/db');
const { parseBody } = require('../middleware/authmiddleware');

const login = async (req, res) => {
  try {
    const body = await parseBody(req);
    const { idNumber, password } = body;

    if (!idNumber || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ID Number and password are required' }));
      return;
    }

    const result = await pool.query(
      'SELECT id, full_name, id_number, password FROM users WHERE id_number = $1',
      [idNumber]
    );

    if (result.rowCount === 0 || result.rows[0].password !== password) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid ID Number or Password' }));
      return;
    }

    const user = result.rows[0];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        id_number: user.id_number,
      },
    }));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unable to process login' }));
  }
};

const register = async (req, res) => {
  try {
    const body = await parseBody(req);
    const { fullName, idNumber, password } = body;

    if (!fullName || !idNumber || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'fullName, idNumber, and password are required' }));
      return;
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE id_number = $1', [idNumber]);

    if (existingUser.rowCount > 0) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User already exists' }));
      return;
    }

    const result = await pool.query(
      'INSERT INTO users(full_name, id_number, password) VALUES($1, $2, $3) RETURNING id, full_name, id_number',
      [fullName, idNumber, password]
    );

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'User registered successfully',
      user: result.rows[0],
    }));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unable to register user' }));
  }
};

module.exports = {
  login,
  register,
};

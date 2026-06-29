const { login, register } = require('../controllers/authcontroller');

const authRoutes = (req, res) => {
  if (req.method === 'POST' && req.url === '/api/login') {
    return login(req, res);
  }

  if (req.method === 'POST' && req.url === '/api/register') {
    return register(req, res);
  }

  return null;
};

module.exports = authRoutes;

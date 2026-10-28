const sessionService = require('../modules/sessions/session.service');

function authenticate(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'A bearer token is required.' },
    });
  }

  return sessionService.findByAccessToken(match[1])
    .then((session) => {
      if (!session) {
        return res.status(401).json({
          error: { code: 'INVALID_TOKEN', message: 'The access token is invalid or expired.' },
        });
      }
      req.auth = { sessionId: session.id, userId: session.userId.toString() };
      return next();
    })
    .catch(next);
}

module.exports = { authenticate };

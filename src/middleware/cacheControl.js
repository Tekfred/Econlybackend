function cacheControl(maxAgeSeconds = 0) {
  return (req, res, next) => {
    res.set('Cache-Control', `private, max-age=${maxAgeSeconds}`);
    next();
  };
}

module.exports = { cacheControl };

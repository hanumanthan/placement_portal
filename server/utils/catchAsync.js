/**
 * Wraps async route handlers so we don't need try/catch in every controller.
 * Usage: router.get('/route', catchAsync(myHandler))
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;

import { RequestHandler } from 'express';

/**
 * Restrict API access from browser.
 * Frontend has http interceptor configured to add this custom header (x-client-request)
 * so they are free to access resources.
 */
const restrictBrowser: RequestHandler = (req, res, next) => {
  if (req.headers['x-client-request']) {
    return next();
  } else {
    // API access from browser will be forbidden
    return res.sendStatus(403);
  }
};

export default restrictBrowser;

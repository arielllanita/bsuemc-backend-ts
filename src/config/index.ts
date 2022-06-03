const isProduction = process.env.NODE_ENV === 'production ';

// DATABASE
export const DB_URI = isProduction
  ? 'mongodb+srv://ariel:4udeu9iq6uj3IBDv@capstone.6bmo6he.mongodb.net/bsu-emc?retryWrites=true&w=majority'
  : 'mongodb://localhost:27017/bsu_emc';

// CORS
export const ORIGIN = isProduction ? 'https://bsuemc.netlify.app' : 'http://localhost:3000';
export const CREDENTIALS = true;

// LOG
export const LOG_FORMAT = isProduction ? 'combined' : 'dev';
export const LOG_DIR = '../logs';

// TOKEN
export const TOKEN = 'technogeekssecretkeyforjwt';

// NODE ENVIRONMENT
export const NODE_ENV = isProduction ? 'production' : 'development';

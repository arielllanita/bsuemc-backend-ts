const isProduction = process.env.NODE_ENV === 'production ';

// DATABASE
export const DB_URI = isProduction
  ? 'mongodb+srv://ariel:4udeu9iq6uj3IBDv@capstone.6bmo6he.mongodb.net/bsu-emc?retryWrites=true&w=majority'
  : 'mongodb://localhost:27017/bsu_emc';

// CORS
export const CORS_CONFIG = {
  origin: isProduction ? ['https://bsuemc.netlify.app', 'https://bsuemc.herokuapp.com'] : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept', 'X-XSRF-TOKEN', 'X-CLIENT-REQUEST'],
  credentials: true,
  maxAge: isProduction ? 900 : 1,
};
export const ORIGIN = ['https://bsuemc.netlify.app', 'http://localhost:3000'];
export const CREDENTIALS = true;

// LOG
export const LOG_FORMAT = isProduction ? 'combined' : 'dev';
export const LOG_DIR = '../logs';

// TOKEN
export const SECRET_KEY = 'technogeekssecretkeyforjwt';

// NODE ENVIRONMENT
export const NODE_ENV = isProduction ? 'production' : 'development';

// GMAIL (inser gmail account here)
export const GMAIL = '';
export const GMAIL_PASSWORD = ''; // App Password here

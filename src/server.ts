import App from '@/app';
// import validateEnv from '@utils/validateEnv';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import LoanRoute from '@routes/loan.route';
import UsersRoute from '@routes/users.route';

// validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new LoanRoute()]);

app.listen();

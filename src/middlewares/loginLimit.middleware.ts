import { LoginDto } from '@/dtos/auth.dto';
import userModel from '@/models/users.model';
import { sendEmail } from '@/utils/mailer';
import { format, formatDistanceToNow } from 'date-fns';
import rateLimit, { RateLimitExceededEventHandler } from 'express-rate-limit';
import { HttpException } from '@exceptions/HttpException';
import codesModel from '@/models/codes.model';
import { randomBytes } from 'crypto';

const rateLimitedHander: RateLimitExceededEventHandler = async (req, res, next, opts) => {
  try {
    const { email }: LoginDto = req.body;

    const { _id: user } = await userModel.exists({ email });
    if (user && req['rateLimit']?.current === 6) {
      const accountAlreadyLocked = await codesModel.exists({ user });
      
      if (!accountAlreadyLocked) {
        const code = randomBytes(3).toString('hex');
        
        await codesModel.create({ user, code, type: 'ACCOUNT LOCK' });
        await sendEmail({
          recipientEmail: email,
          subject: 'Security 🔐',
          text: `We have detected 5 login attempts to your account today (${format(
            new Date(),
            'MMM dd, yyyy hh:mm aaa',
          )}) to help you secure your account we temporarily locked your account. 
          Enter this code ${code} to unlock your account after login.\n\n\n-- The Management.`,
        });
      }
    }

    const timeRemaining = formatDistanceToNow(req['rateLimit']?.resetTime);
    const additionalMessage = timeRemaining + ' and input the code sent to your email.'
    res.status(opts.statusCode).json({ message: opts.message.concat(additionalMessage) });
  } catch (error) {
    next(new HttpException(500, 'Internal error.'));
  }
};

export const loginLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per `window` (here, per 1 minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'You have incorrectly typed invalid credentials 5 times, please try again after ',
  handler: rateLimitedHander,
});

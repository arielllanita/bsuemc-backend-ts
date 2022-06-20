import { LoginDto } from '@/dtos/auth.dto';
import userModel from '@/models/users.model';
import { sendEmail } from '@/utils/mailer';
import { format, formatDistanceToNow } from 'date-fns';
import rateLimit, { RateLimitExceededEventHandler } from 'express-rate-limit';
import { HttpException } from '@exceptions/HttpException';

const rateLimitedHander: RateLimitExceededEventHandler = async (req, res, next, opts) => {
  try {
    const { email }: LoginDto = req.body;

    const validEmail = await userModel.exists({ email });
    if (validEmail && req['rateLimit']?.current === 6) {
      await sendEmail({
        recipientEmail: email,
        subject: 'Security 🔐',
        text: `We have detected 5 login attempts to your account today (${format(
          new Date(),
          'MMM dd, yyyy hh:mm aaa',
        )}) for your security we temporarily locked your account.\n\n\n-- The Management.`,
      });
    }

    const timeRemaining = formatDistanceToNow(req['rateLimit']?.resetTime);
    res.status(opts.statusCode).json({ message: opts.message.concat(timeRemaining) });
  } catch (error) {
    next(new HttpException(500, 'Internal error.'));
  }
};

export const loginLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 5 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'You have incorrectly typed invalid credentials 5 times, please try again after ',
  handler: rateLimitedHander,
});

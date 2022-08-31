import { GMAIL, GMAIL_PASSWORD } from '@/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL,
    pass: GMAIL_PASSWORD,
  },
});

export const sendEmail = ({ recipientEmail, subject, text }) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from: `"BSU EMC" ${GMAIL}`,
        to: recipientEmail,
        subject: subject,
        text: text,
      },
      err => {
        if (err) {
          console.log('EMAIL ERROR', err);
          reject('Problem occurred while sending email');
        } else {
          console.log('EMAIL SENT SUCCESS!');
          resolve('Email sent successfully!');
        }
      },
    );
  });
};

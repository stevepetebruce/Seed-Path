const nodeMailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodeMailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

transport.sendMail({
  from: 'Steve <steven@mail.com>',
  to: 'test@test.com',
  subject: 'Test Subject',
  html: 'My test <strong>Messages</strong>',
  text: 'My test Message'
})
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

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  return html;
}

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const mailOptions = {
    from: 'Seed Path <stevepetebruce@hotmail.com>',
    to: options.user.email,
    subject: options.subject,
    html: html,
    text: 'My test Message set'
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};
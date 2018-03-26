/*
 * Init nunjucks for rendering email templates
 */
const nunjucks = require('nunjucks');
nunjucks.configure({autoescape: true});

const excludeKeys = (object, ignoreKeys)  => {
  return Object.keys(object)
    .filter(key => !ignoreKeys.includes(key))
    .reduce((acc, key) => {
      acc[key] = object[key];
      return acc;
    }, {});
};

/*
 * Init mailgun params for sending emails
 */
const provider = {
  client: {
    mailgun: require('mailgun-js')({
      apiKey: 'key-79202106f3be527408c6fdf60fcc4044',
      domain: 'simpleProject.com'
    }),
    from: 'SimpleProject <studio@simpleProject.com>'
  },
  retoucher: {
    mailgun: require('mailgun-js')({
      apiKey: 'key-79202106f3be527408c6fdf60fcc4044',
      domain: 'retoucher.space'
    }),
    from: 'Moderator <moderator@retoucher.space>'
  }
};

const sendEmail = (providerName, mailObject) => {
  if (!provider[providerName]) {
    return Promise.reject('Invalid provider');
  }
  if (Array.isArray(mailObject.to)) {
    mailObject.to = mailObject.to.join(', ');
  }
  const data = {
    from: mailObject.from,
    to: mailObject.to,
    subject: mailObject.subject,
    html: mailObject.mailContent
  };
  return new Promise((resolve, reject) => {
    provider[providerName].mailgun.messages().send(data, (err, body) => {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  })
};

exports.sendClientEmail = (from, to, subject, template, sendArgs) => {
  const mailContent = nunjucks.renderString(template, sendArgs);
  const parsedSubject = nunjucks.renderString(subject, sendArgs);
  return sendEmail('client', {from: from || provider['client'].from, to: to, subject: parsedSubject, mailContent: mailContent});
};

exports.sendRetoucherEmail = (from, to, subject, template, sendArgs) => {
  const mailContent = nunjucks.renderString(template, sendArgs);
  const parsedSubject = nunjucks.renderString(subject, sendArgs);
  return sendEmail('retoucher', {from: from || provider['retoucher'].from, to: to, subject: parsedSubject, mailContent: mailContent});
};

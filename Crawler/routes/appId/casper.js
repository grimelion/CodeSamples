var casper = require('casper').create({
  verbose: true
});
const url = 'https://play.google.com/store/apps/details?id=com.' + casper.cli.get('appId');

casper.start(url);

casper.then(function() {
  var title = this.evaluate(function () {
    return Array.prototype.map.call(document.getElementsByClassName('id-app-title'), function (link) {
      return link.innerText;
    });
  });

  var author = this.evaluate(function () {
    return Array.prototype.map.call(document.querySelectorAll('a.document-subtitle > span'), function (link) {
      return link.innerText;
    });
  });

  var email = this.evaluate(function () {
    return Array.prototype.map.call(document.getElementsByClassName('dev-link'), function (link) {
      return link.getAttribute('href');
    });
  });

  var category = this.evaluate(function () {
    return Array.prototype.map.call(document.getElementsByClassName('document-subtitle category'), function (link) {
      var result = link.getAttribute('href');
      return result.split('/').reverse()[0];
    });
  });

  var downloads = this.evaluate(function () {
    return Array.prototype.map.call(document.querySelectorAll('div[itemprop="numDownloads"]'), function (link) {
      return link;
    });
  });

  console.log(JSON.stringify(title + ',' + author[0] + ',' + email[1].split(':')[1] + ',' + category + ',' + downloads));

  casper.page.close();
});

casper.run(function() {
  this.exit();
});
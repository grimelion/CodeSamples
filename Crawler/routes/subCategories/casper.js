var casper = require('casper').create({
  verbose: true
});
const url = 'https://play.google.com/store/apps/category/' + casper.cli.get('catId');

casper.start(url);

casper.then(function() {
  var result = this.evaluate(function () {
    return Array.prototype.map.call(document.querySelectorAll('h2.single-title-link > a.title-link'), function (link) {
      return 'https://play.google.com' + link.getAttribute('href');
    });
  });
  console.log(JSON.stringify(result));
  casper.page.close();
});

casper.run(function() {
  this.exit();
});
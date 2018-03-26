var casper = require('casper').create({
  verbose: true,
  pageSettings: {
    webSecurityEnabled: false
  }
});
var _ = require('lodash');

const url = 'https://play.google.com/store/apps/category/'
            + casper.cli.get('catId')
            + '/collection/'
            + casper.cli.get('subcatId');

var scrolled = 0;
var scrollDelta = null;

var getContent = function() {
  casper
  .wait(2000, function() {
    casper.scrollToBottom();
    var newScrolled = casper.evaluate(function() {
      return window.scrollY;
    });
    scrollDelta = newScrolled - scrolled;
    scrolled = newScrolled;
    casper.evaluate(function() {
      document.querySelector('#show-more-button').click();
    });
  })
  .then(function() {
    if (scrollDelta !== 0) {
      getContent();
    } else {
      return;
    }
  });
};

casper
.start(url, function() {
  getContent();
})
.then(function() {
  var result = casper.evaluate(function () {
    return Array.prototype.map.call(document.querySelectorAll('.card-content > .card-click-target'), function (link) {
      return 'https://play.google.com' + link.getAttribute('href');
    });
  });

  console.log(result.length);
  casper.page.close();
})
.run(function() {
  this.exit();
});
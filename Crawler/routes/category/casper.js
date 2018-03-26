var casper = require('casper').create({
  verbose: true
});
var utils = require('utils');
var url = 'https://play.google.com/store/apps/';
var result = {
  categories: []
};

casper.start(url);

casper.then(function() {
  result.categories = this.evaluate(function () {
    var links = document.querySelectorAll('ul.submenu-item-wrapper > li.child-submenu-link-wrapper > a.child-submenu-link');
    links = Array.prototype.map.call(links, function (link) {
      var value = link.getAttribute('href').split('/');
      value = value[value.length - 1];
      return {
        title: link.getAttribute('title'),
        id: value
      };
    });
    return links;
  });

  console.log(JSON.stringify(result.categories, null, 2));
});

casper.run(function() {
  this.exit();
});
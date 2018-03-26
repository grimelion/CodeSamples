const cp = require('child_process');

function getAppsFromSubcategory(proxyConfig, catId, subcatId, cred) {
  return cp.spawn('casperjs', [`--proxy=${proxyConfig.host}:${proxyConfig.port}`,
                               `--proxy-type=${proxyConfig.type}`,
                               `--proxy-auth=${cred.username}:${cred.password}`,
                               `--catId=${catId}`,
                               `--subcatId=${subcatId}`,
                               '--ignore-ssl-errors=true',
                               '--ssl-protocol=any',
                               './casper.js'
  ], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });
};


module.exports = {
  getAppsFromSubcategory
};
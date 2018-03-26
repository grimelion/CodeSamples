const cp = require('child_process');

function getCategories(proxyConfig, cred) {
  return cp.spawn('casperjs', [`--proxy=${proxyConfig.host}:${proxyConfig.port}`,
                               `--proxy-type=${proxyConfig.type}`,
                               `--proxy-auth=${cred.username}:${cred.password}`,
                               '--ignore-ssl-errors=true',
                               '--ssl-protocol=any',
                               './casper.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });
};


module.exports = {
  getCategories
};
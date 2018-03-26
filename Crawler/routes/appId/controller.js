const cp = require('child_process');

function getApp(proxyConfig, appId, cred) {
  return cp.spawn('casperjs', [`--appId=${appId}`,
                               `--proxy=${proxyConfig.host}:${proxyConfig.port}`,
                               `--proxy-auth=${cred.username}:${cred.password}`,
                               `--proxy-type=${proxyConfig.type}`,
                               '--ignore-ssl-errors=true',
                               '--ssl-protocol=any',
                               './casper.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });
};

module.exports = {
  getApp
};
module.exports = {
  QUEUE_DELAY: 13000,
  QUEUE_FREQUENCY: 2,
  RESPONSE_CODES: {
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    BAD_GATEWAY: 502
  },
  URLS: {
    GET_APP: (countryKey, appID) =>
      `https://playrest.stage.nodeart.io/${countryKey}/app/${appID}`,
    GET_ALL_APPS: (countryKey, appId) =>
      `https://playrest.stage.nodeart.io/${countryKey}/apps/${appId}`
  }
};

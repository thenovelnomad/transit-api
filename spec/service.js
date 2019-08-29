const { handler } = require('../service');

(async() => {
  try {
    let response = await handler({
      httpMethod: 'GET',
      queryStringParameters: {
        limit: 1000,
        // route: '4',
        // delayed: 'true',
        from: 1567036800000,
        to: 1567066204000
      }
    });
    console.log(response.statusCode, JSON.parse(response.body));
  } catch (err) {
    console.log(err);
  }
})();

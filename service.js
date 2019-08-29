console.log('Loading function');
const config = require('config');
const dynamoose = require('dynamoose');
const VehicleState = require('./models/vehicles');

exports.handler = async(event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const done = (err, res) => {
    const response = {
      statusCode: err ? 400 : 200,
      statusDescription: err ? "400 Bad Request" : "200 OK",
      isBase64Encoded: false,
      body: err ? JSON.stringify({ errors: [err.message] }) : JSON.stringify(res),
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log('Response', response);
    return response;
  };

  if (event.httpMethod !== 'GET') {
    const err = new Error(`Unsupported method "${event.httpMethod}"`);
    return done(err);
  }

  // query params
  // vehicleId
  // to/from timestamps
  // delayed
  // route
  // limit
  // lastKey
  var vehicleId, to, from, delayed, route, limit, lastKey;
  if (event.queryStringParameters) {
    var {
      vehicleId,
      to,
      from,
      delayed,
      route,
      limit,
      lastKey,
    } = event.queryStringParameters;
  }

  let scan = VehicleState.scan()

  if (vehicleId) scan = scan.where('vehicleId').eq(vehicleId);
  if (delayed) scan = scan.where('delayed').eq(delayed === 'true');
  if (route) scan = scan.where('route').eq(route);
  if (from) {
    if (to) scan = scan.where('timestamp').between(from, to);
    else scan = scan.where('timestamp').ge(from);
  }
  if (limit) scan = scan.limit(limit);


  console.log('set up scan', scan);
  try {
    const results = await scan.exec();
    console.log(results.length, results.lastKey);


    return done(null, {
      data: results,
    });
  } catch (err) {
    return done(err);
  }
};

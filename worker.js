console.log('Loading function');
const config = require('config');
const dynamoose = require('dynamoose');
const request = require('request-promise');

const VehicleState = require('./models/vehicles');

const apiEndpoint = `${config.get('busApi.baseUrl')}/bustime/api/v3/getvehicles`;
const apiKey = config.get('busApi.apiKey');
const routes = config.get('busApi.routes').join(',');

exports.handler = async (event) => {
  console.log('Running data worker.');

  console.log('Retrieve vehicle data from Port Authority', { routes });
  const response = await request(apiEndpoint, {
    qs: {
      key: apiKey,
      rt: routes,
      tmres: 's',
      format: 'json'
    },
    json: true
  });

  if (response['bustime-response']) {
    if (response['bustime-response'].error)
      return new Error(response['bustime-response'].error);
    if (response['bustime-response'].vehicle) {
      const vehicles = response['bustime-response'].vehicle.map((vehicle) => {
        let instance = new VehicleState({
          vehicleId: vehicle.vid,
          timestamp: parseTimestamp(vehicle.tmstmp),
          delayed: vehicle.dly,
          location: {
            lat: vehicle.lat,
            lon: vehicle.lon
          },
          heading: vehicle.hdg,
          speed: vehicle.spd,
          route: vehicle.rt
        });

        console.log('created new vehicle state object', instance);
        return instance.save();
      });

      return await Promise.all(vehicles).then((results) => {
        console.log('created records', results);
      });
    }
  }
  return null;
};

function parseTimestamp(ts) {
  const [ date, time ] = ts.split(' ');
  const year = date.slice(0,4);
  const month = date.slice(4,6);
  const day = date.slice(6);
  return (new Date(`${year}-${month}-${day} ${time}`)).toISOString();
}

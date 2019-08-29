const dynamoose = require('dynamoose');

const Schema = dynamoose.Schema;
// {
// "vid": "5813", Vehicle id
// "tmstmp": "20190828 09:10", Timestamp
// "lat": "40.46489154167895", vehicle latitude
// "lon": "-80.07047271728516", vehicle longitude
// "hdg": "101", Degree heading
// "dly": false, Delayed?
// "spd": 0, current speed
// }

var vehicleStateSchema = new Schema({
  vehicleId: {
    type: String,
    hashKey: true
  },
  timestamp: {
    type: Date,
    rangeKey: true
  },
  delayed: {
    type: Boolean,
    index: true
  },
  location: {
    type: 'map',
    map: {
      lat: String,
      lon: String
    }
  },
  heading: {
    type: String
  },
  speed: {
    type: Number
  },
  route: {
    type: String
  }
},
{
  throughput: { read: 15, write: 5 },
  timestamps: true,
  expires: 7 * 24 * 60 * 60, // 1 week
  useNativeBooleans: false
});

const VehicleState = dynamoose.model('VehicleState', vehicleStateSchema, { serverSideEncryption: true });

module.exports = VehicleState;

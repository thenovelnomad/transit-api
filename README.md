# Port Authority Vehicle Data Aggregation

This app aggregates real time vehicle data from the Port Authority API, and provides access to the data through a simple API. The idea behind the aggregation of this data is that historical delay data could be aggregated to predict future delays as well as determine routes currently delayed that are not typically delayed.

It consists of a worker service which retrieves data from the Port Authority API and stores the data, and an API service which provides access to the aggregated data.

# API

The api consists of a single endpoint which returns vehicle data in the following format:

```
{
  data: [
    VehicleState {
      vehicleId: String - Transit vehicle identifier,
      timestamp: Date - Date time of the vehicle data,
      route: String - Vehicle route,
      delayed: Boolean - Is vehicle delayed?,
      location: Map {
        lat: String - Latitude,
        lon: String - Longitude
      },
      heading: String - Directional heading in degrees,
      speed: Number - Speed in mph
    },
    ...
  ]
}
```

The api allows querying by vehicleId, timestamp, route, delayed status, as well as setting a limit of results.

Querying by vehicle ID, route, delayed status, and setting a limit are straightforward. Simply pass a query parameter in the URL of the format `property=value`.

```
http://localhost/?vehicleId=1701&delayed=true&route=20&limit=20
```

Notes:
* The limit actually sets the number of records scanned in the DynamoDB database and not returned records. This is an area for improvement.
* The data is only currently being pulled for routes 4 and 20. This is configurable for the worker app.

To limit resutls by timestamp, you may pass `from` and, optionally, `to` query parameters with timestamp values in milliseconds since epoch.

```
http://localhost/?delayed=true&from=1567036800000
http://localhost/?delayed=true&from=1567036800000&to=1567066204000
```


# Infrastructure

The services are developed to be run serverless on AWS Lambda and connect to AWS DynamoDB as a data store. A cron job triggers the worker to pull data and store it every 5 minutes. The API lambda is accessible via an application load balancer, but could also be configured to use API gateway for access.

API is available at `http://transit-api-818539203.us-east-1.elb.amazonaws.com/`

# Setup

###Configure AWS credentials on your machine.
Test currently connect to remote DynamoDB, so this is necessary.

###Configure environment variables.

```
export AWS_PROFILE=***; # AWS profile you intend to use
export API_KEY=***; # Port Authority api key
```

###Install dependencies.

Install nodejs 10.16.3 - https://nodejs.org/en/

```
npm install
```

### Run tests
Note: Tests are cursor to show ability to run. Run the worker test a few times to generate data for the api.

```
npm run test-worker
npm run test-service
```

# Next Steps

* improve testing so there are no external dependencies and tests all use cases
* add parameter validation
* add pagination so excess data is no returned
* Implement infrastructure as code via terraform
* Add aggregation of further transit data so API could be used to determine which stops / locations are affected by delays

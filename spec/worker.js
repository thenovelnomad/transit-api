const { handler } = require('../worker');

(async() => {
  try {
    await handler({});
  } catch (err) {
    console.log(err);
  }
})();

const https = require('https');
var total_revenue = 0;
var page = 1;

function getOrders(page) {
  https.get('https://shopicruit.myshopify.com/admin/orders.json?page='+page+'&access_token=c32313df0d0ef512ca64d5b336a0d7c6', (res) => {
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];
    var parsedData;
    var orders = [];

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.log(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
      try {
        parsedData = JSON.parse(rawData);

        if(parsedData.orders.length > 0){
          orders = parsedData.orders;

          for(i = 0; i < orders.length; i++){
              total_revenue += parseFloat(orders[i].total_price);
          }
          page++;
          getOrders(page);
        } else {
          return console.log('The total order revenue is: ', total_revenue.toFixed(2));
        }
      } catch (e) {
        console.log(e.message);
      }
    });
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });
}

function main() {
    getOrders(page);
}

main();

const express = require('express')
const bodyParser = require('body-parser');
const AddressBuilder = require('./modules/AddressBuilder')

const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
})); // support encoded bodies




app.get('/', function (req, res) {

  res.render("index");

})

app.post('/fetch',async function (req, res) {
  // https://host2.rjmusicmedia.com/media/mp3/mp3-256/Sasy-Che-Pesari.mp3
  // "https://www.radiojavan.com/mp3s/mp3/Sasy-Che-Pesari"
  // var address = RjUtility.getAddress("https://www.radiojavan.com/videos/video/siamak-abbasi-man-divane-nistam");

  var url = req.body.url;

  let crawler = new AddressBuilder.Builder(url).detectType().crawler();
  await crawler.then((response) => {
    response.getDownloadLink().then((address) => {
      res.send(address);
    })
  }).catch(() => {
    res.send("not found!!");
  });
})


// Bind the app to a specified port
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);
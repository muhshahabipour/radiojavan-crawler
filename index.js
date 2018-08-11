const express = require('express')
const bodyParser = require('body-parser');
const path = require("path");
const AddressBuilder = require('./js/modules/AddressBuilder');

const app = express();

app.use('/node_modules', express.static('node_modules'))

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
})); // support encoded bodies

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + "/views");

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/fetch', function (req, res) {
  res.redirect('/');
});

app.post('/fetch', function (req, res) {
  var url = req.body.url;
  console.log("start URL ===========> ", url)
  new AddressBuilder.Builder(url).detectType().crawler().then((response) => {
    if (response.filePath.length > 1) {
      response.getDownloadLink().then((response1) => {
        console.log("end URL ===========> ", response1)
        res.render("fetch", {
          downloadLink: response1
        });
      }).catch((response1) => {
        console.log("end URL ===========> ", response1)
        res.render("fetch", {
          downloadLink: ""
        });
      })
    } else {
      res.render("fetch", {
        downloadLink: "not found!"
      });
    }
  }).catch((response) => {
    console.log("end URL ===========> ", response)
    res.render("fetch", {
      downloadLink: ""
    });
  });

});


// Bind the app to a specified port
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);
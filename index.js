const express         = require('express')
const bodyParser      = require('body-parser');
const path            = require("path");
const axios           = require("axios");
const AddressBuilder  = require('./js/modules/AddressBuilder');

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

app.get('/test', function (req, res) {
  axios.get('https://www.radiojavan.com/mp3s/mp3/Sasy-Che-Pesari')
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
});

app.get('/fetch', function (req, res) {
  res.redirect('/');
});

app.post('/fetch', async function (req, res) {
  var url = req.body.url;
  await new AddressBuilder.Builder(url).detectType().crawler()
    .then((response) => {
      response.getDownloadLink().then((address) => {
        res.render("fetch", {
          downloadLink: address
        });
      })
    }).catch(() => {
      res.render("fetch", {
        downloadLink: "not found!!"
      });
    });
});


// Bind the app to a specified port
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);
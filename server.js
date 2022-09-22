require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');
const ejsLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const { default: axios } = require('axios');
const petFinderKey = process.env.APIKEY
const petFinderSecret = process.env.APISECRET
const db = require('./models');


const SECRET_SESSION = process.env.SECRET_SESSION;
console.log('yooooo.....>>>', SECRET_SESSION);

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);
app.use(methodOverride('_method'));


app.use(session({
  secret: SECRET_SESSION,    // What we actually will be giving the user on our site as a session cookie
  resave: false,             // Save the session even if it's modified, make this false
  saveUninitialized: true    // If we have a new session, we save it, therefore making that true
}));

app.use(flash());            // flash middleware

app.use(passport.initialize());      // Initialize passport
app.use(passport.session());         // Add a session

app.use((req, res, next) => {
  console.log('res locals >>>', res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

// Add this above /auth controllers
app.get('/profile', isLoggedIn, async (req, res) => {
  try {
  const { id, name, email } = req.user.get();
  const favpets = await db.favoritepet.findAll({})
  res.render('profile', { name, animals:favpets, root: req.get("host") });
  favpets.forEach(pet => {
  })
  // console.log(favpets)
}
  catch (error){
    console.log(error)
  }
  // res.render('profile', { id, name, email });
});

// controllers
app.use('/auth', require('./controllers/auth'));
app.use('/animals', require('./controllers/animals.js'));
app.use('/profile', require('./controllers/comment'));

//home route
app.get('/', (req, res) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', petFinderKey);
  params.append('client_secret', petFinderSecret);
  axios.post(`https://api.petfinder.com/v2/oauth2/token`, params)
    .then(accessToken => {
      const header = "Bearer " + accessToken.data.access_token;
      const options = {
        method: 'GET',
        headers: { 'Authorization': header },
        url: "https://api.petfinder.com/v2/animals?type=dog&page=2"
      }
      axios(options)
        .then((response) => {
          let animals = response.data.animals
          res.render('index', { animals: animals, root: req.get("host") })
        })
        .catch(error => {
          console.log(error)
        })
    })
    .catch(error => {
      console.log(error)
    })
    })

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
  });

  module.exports = server;

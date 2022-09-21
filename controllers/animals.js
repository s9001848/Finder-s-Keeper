require('dotenv').config()
const { default: axios } = require('axios');
const express = require('express');
const petFinderKey = process.env.APIKEY
const petFinderSecret = process.env.APISECRET
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');


//Route calling the API, showing all the animals before user puts in a zipcode
router.get('/', isLoggedIn, async (req, res) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', petFinderKey);
    params.append('client_secret', petFinderSecret);
    await axios.post(`https://api.petfinder.com/v2/oauth2/token`, params)
      .then(accessToken => {
        const header = "Bearer " + accessToken.data.access_token;
        const options = {
            method: 'GET',
            headers: { 'Authorization': header },
            url: `https://api.petfinder.com/v2/animals`
        }
        axios(options)
        .then((response) => {
            let animals = response.data.animals
            res.render('animalsIndex', {animals: animals}) 
            console.log(animals[0].name)
            })
        .catch(error => {
            console.log(error)
        })
    })
    .catch(error => {
        console.log(error)
    })
})

//Route show all animals when user puts in their zipcdoe
router.get('/zipsearch', isLoggedIn, (req, res) => {
    let zipCode = req.query.zipcode
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
            url: `https://api.petfinder.com/v2/animals?types=true&location=${zipCode}&distance=20&limit=100`
        }
        axios(options)
        .then((response) => {
            let animals = response.data.animals
            res.render('animalsResults', {animals: animals, zipCode: zipCode}) 
            console.log(animals[0].name)
            })
        .catch(error => {
            console.log(error)
        })
    })
    .catch(error => {
        console.log(error)
    })
})

//Route showing animals by their animalId stored in the data base
router.get('/:animal_id', isLoggedIn, (req, res) => {
    let animalId = req.params.animal_id
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
              url: `https://api.petfinder.com/v2/animals/${animalId}`
        }
        axios(options)
        .then((response) => {
            let animalName = response.data.animal.name
            let animalStatus = response.data.animal.status
            let animalImage = response.data.animal.photos[0]?.large
            let animalSpecies = response.data.animal.species
            let animalAge = response.data.animal.age
            let animalBreed = response.data.animal.breeds.primary
            let animalGender = response.data.animal.gender
            let animalBabies = response.data.animal.attributes.spayed_neutered
            let animalContact = response.data.animal.contact
            let animalHouseTrained = response.data.animal.attributes.house_trained
            let animalShots = response.data.animal.attributes.shots_current
            res.render('animalDetail', {animalName: animalName, animalStatus: animalStatus, animalSpecies: animalSpecies, animalAge: animalAge, animalBreed, animalGender, animalImage, animalBabies, animalContact, animalHouseTrained, animalShots })
            })
        .catch(error => {
            console.log(error)
        })
    })
    .catch(error => {
        console.log(error)
    })
})

module.exports = router;
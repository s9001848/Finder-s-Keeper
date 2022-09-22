const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn')
const db = require('../models')
const { default: axios } = require('axios');
const petFinderKey = process.env.APIKEY
const petFinderSecret = process.env.APISECRET

// Route to show all all favorited animals
router.get('/', isLoggedIn, (req, res)=>{
    console.log('this is req.query', req.query)
    db.favoritepet.findAll({
        where: {userId: res.locals.currentUser.id},
        incude: [db.favoritepet]
    })
    .then(faves => {
        res.render('profile', {pets: faves})
        // console.log('this is faves', faves)
    })
    .catch(error => {
        console.log(error)
    })
})

//Route to add an animal to the db, when user presses 'add to favorites' button
router.post('/:id', isLoggedIn, (req, res) => {
    const data = JSON.parse(JSON.stringify(req.body))
    console.log(data)
    db.favoritepet.create({
        animalId: data.id,
        name: data.name,
        status: data.status,
        age: data.age,
        breed: data.breed,
        userId: res.locals.currentUser.id,
        image: data.image,
        gender: data.gender,
        description: data.description
    })
    .then((newFavePet) => {
        res.redirect('/profile')
        console.log(newFavePet)
    })
    .catch(error => {
        console.log(error)
    })
})

//Route to Delete a comment
router.delete('/:animalId/comment/:id', isLoggedIn, (req, res)=> {
    db.comment.findOne({
        where: {id:req.params.id}
    })
    .then(foundcomment => {
        foundcomment.destroy()
        .then(deletedItem => {
            // console.log('this is animalID', req.query.id)
            res.redirect(`/profile/${req.params.animalId}`)
        })
        .catch(error => {
            console.log(error)
        }) 
    })
})

//Route to Delete a favorited animal
router.delete('/:id', isLoggedIn, async (req, res)=> {
    await db.favoritepet.destroy({
        where: {id: req.params.id}
    })
    .then(deletedItem => {
        res.redirect('/profile')
    })
    .catch(error => {
        console.log(error)
    }) 
})

// route for when the comment is edited after user presses sumbit edit button
router.put('/:animalId', (req, res) => {
    db.comment.findOne({
        where: {animalId: req.params.animalId, userId: res.locals.currentUser.id}
    })
    .then(foundComment => {
        console.log('this is foundComment', foundComment)
        foundComment.update({
            description: req.body.description

        })
    .then(updatedComment => {
        // console.log('this is updated comment', updatedcomment)
           res.redirect(`/profile/${updatedComment.animalId}`)
        })
    })
})

//Route for to show all comments
router.get('/:animalId', isLoggedIn, (req, res) => {
    let animalId = req.params.animalId 

    db.comment.findAll({
        where: {animalId: animalId}
    })
    .then((comments) => {
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
                let animalId = response.data.animal.id
                let animalName = response.data.animal.name
                let animalStatus = response.data.animal.status
                let animalImage = response.data.animal.photos[0].large
                let animalSpecies = response.data.animal.species
                let animalAge = response.data.animal.age
                let animalBreed = response.data.animal.breeds.primary
                let animalGender = response.data.animal.gender
                let animalBabies = response.data.animal.attributes.spayed_neutered
                let animalContact = response.data.animal.contact
                let animalUrl = response.data.animal.url
                let animalHouseTrained = response.data.animal.attributes.house_trained
                let animalShots = response.data.animal.attributes.shots_current
                let animalDes = response.data.animal.description
                res.render('animalDetail', {animalName: animalName, animalStatus: animalStatus, animalSpecies: animalSpecies, animalAge: animalAge, animalBreed, animalGender, animalImage, animalBabies, animalContact, animalHouseTrained, animalShots, animalUrl, animalId, animalDes, comments})
            })
            .catch(error => {
                console.log(error)
            })
        })
    })
    .catch(error => {
        console.log(error)
    })
})

// route to once user pressed 'Edit Comment' Button
router.get('/:animalId/edit', (req, res) => {
    let animalId = req.params.animalId 

    db.comment.findOne({
        where: {animalId: animalId}
    })
    .then((comments) => {
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
            console.log('this is comments', comments)
            axios(options)
            .then((response) => {
                let animalId = response.data.animal.id
                let animalName = response.data.animal.name
                let animalStatus = response.data.animal.status
                let animalImage = response.data.animal.photos[0].large
                let animalSpecies = response.data.animal.species
                let animalAge = response.data.animal.age
                let animalBreed = response.data.animal.breeds.primary
                let animalGender = response.data.animal.gender
                let animalBabies = response.data.animal.attributes.spayed_neutered
                let animalContact = response.data.animal.contact
                let animalUrl = response.data.animal.url
                let animalHouseTrained = response.data.animal.attributes.house_trained
                let animalShots = response.data.animal.attributes.shots_current
                let animalDes = response.data.animal.description
                res.render('animalEditComment', {animalName: animalName, animalStatus: animalStatus, animalSpecies: animalSpecies, animalAge: animalAge, animalBreed, animalGender, animalImage, animalBabies, animalContact, animalHouseTrained, animalShots, animalUrl, animalId: animalId, animalDes, comments })
            })
            .catch(error => {
                console.log(error)
            })
        })
    })
    .catch(error => {
        console.log(error)
    })
})

//Route to add comments to database, when user presses 'submit' button on comment
router.post('/:animalId/comments', isLoggedIn, (req, res) => {
    // console.log('this is req.body', req.body)
    db.comment.create({
        animalId: req.params.animalId,
        userId: res.locals.currentUser.id,
        description:req.body.description
    })
    .then(resPost => {
        // console.log('this is resPost', resPost)
        res.redirect(`/profile/${req.params.animalId}`)
    })
    .catch(error => {
        // console.log(error)
        res.send('invalid comment', error)
    })
})


module.exports = router;
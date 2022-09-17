const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn')
const db = require('../models')
const { default: axios } = require('axios');
const petFinderKey = process.env.PET_FINDER_API_KEY
const petFinderSecret = process.env.PET_FINDER_SECRET

// Route to show all all favorited animals
router.get('/', isLoggedIn, (req, res)=>{
    console.log('this is req.query', req.query)
    db.favePet.findAll({
        where: {userId: res.locals.currentUser.id},
        incude: [db.favePet]
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
router.post('/addFave', isLoggedIn, (req, res) => {
    const data = JSON.parse(JSON.stringify(req.body))
    console.log(data)
    db.favePet.create({
        animalId: data.id,
        name: data.name,
        status: data.status,
        age: data.age,
        breed: data.breed,
        userId: res.locals.currentUser.id
    })
    .then((newFavePet) => {
        res.redirect('/profile')
        console.log(newFavePet)
    })
    .catch(error => {
        console.log(error)
    })
})

//Route to Delete a note
router.delete('/:animalId/comment/:id', isLoggedIn, (req, res)=> {
    db.note.findOne({
        where: {id:req.params.id}
    })
    .then(foundNote => {
        foundNote.destroy()
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
router.delete('/:id', isLoggedIn, (req, res)=> {
    db.favePet.destroy({
        where: {id: req.params.id}
    })
    .then(deletedItem => {
        // console.log('you deleted', deletedItem)
        res.redirect('/profile')
    })
    .catch(error => {
        console.log(error)
    }) 
})

// route for when the comment is edited after user presses sumbit edit button
router.put('/:animalId', (req, res) => {
    db.note.findOne({
        where: {animalId: req.params.animalId, userId: res.locals.currentUser.id}
    })
    .then(foundNote => {
        console.log('this is foundNote', foundNote)
        foundNote.update({
            description: req.body.description

        })
    .then(updatedNote => {
        // console.log('this is updated note', updatedNote)
           res.redirect(`/profile/${updatedNote.animalId}`)
        })
    })
})

//Route for to show all notes
router.get('/:animalId', isLoggedIn, (req, res) => {
    let animalId = req.params.animalId 

    db.note.findAll({
        where: {animalId: animalId}
    })
    .then((notes) => {
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
                res.render('animalDetail', {animalName: animalName, animalStatus: animalStatus, animalSpecies: animalSpecies, animalAge: animalAge, animalBreed, animalGender, animalImage, animalBabies, animalContact, animalHouseTrained, animalShots, animalUrl, animalId, animalDes, notes})
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

    db.note.findOne({
        where: {animalId: animalId}
    })
    .then((notes) => {
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
            console.log('this is commentss', comments)
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
                res.render('animalEditComment', {animalName: animalName, animalStatus: animalStatus, animalSpecies: animalSpecies, animalAge: animalAge, animalBreed, animalGender, animalImage, animalBabies, animalContact, animalHouseTrained, animalShots, animalUrl, animalId: animalId, animalDes, notes })
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
    db.note.create({
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


module.exports = router
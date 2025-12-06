const express = require('express')
const router = express.Router()
const StoreController = require('../controllers/store-controller')
const auth = require('../auth')
/*
    Playlist Routes for Playlister Final Project
*/
//Routes accessible - both guest and logged in users
router.get('/playlists', StoreController.getPlaylists)

// Protected routes (require login)
router.post('/playlist', auth.verify, StoreController.createPlaylist)
router.get('/playlist/:id', auth.verify, StoreController.getPlaylistById)
router.get('/playlistpairs', auth.verify, StoreController.getPlaylistPairs)
router.put('/playlist/:id', auth.verify, StoreController.updatePlaylist)
router.post('/playlist/:id/copy', auth.verify, StoreController.copyPlaylist)
router.delete('/playlist/:id', auth.verify, StoreController.deletePlaylist)
router.post('/playlist/:id/play', StoreController.playPlaylist) 
router.post('/playlist/add-song', auth.verify, StoreController.addSongToPlaylist)

module.exports = router
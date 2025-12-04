const express = require('express')
const router = express.Router()
const SongController = require('../controllers/song-controller')
const auth = require('../auth')

/**
 * Song Routes for Playlister - endpoints usage
 */

//For both guest and logged - in users
router.get('/songs', SongController.getSongs)
router.get('/songs/search', SongController.searchSongs)
router.get('/song/:id', SongController.getSongById)

//Protected routes that require login
router.post('/song', auth.verify, SongController.createSong)
router.put('/song/:id', auth.verify, SongController.updateSong)
router.delete('/song/:id', auth.verify, SongController.deleteSong)

module.exports = router
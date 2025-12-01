const mongoose = require ('mongoose')
const Schema = mongoose.Schema

/**
 * Song Model for Playlister
 * - Songs stored in catalog
 * - No two songs have same title, artist, year
 * - Each song tracks who added it, listen count and playlist count 
 */

const SongSchema = new Schema (
    {
        title : {type: String,required: true, trim: true},
        artist: {type: String,required: true, trim: true},
        year: {type: Number, required: true, min: 1000, max: 9999},
        youtubeId: {type: String, required: true, trim: true},
        addedBy: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        numListens: {type: Number, default: 0, min: 0},
        numPlaylists: {type:Number, default: 0, min: 0}
    },
    {timestamps: true}
)

SongSchema.index({title: 1, artist: 1, year: 1}, {unique: true})
module.exports = mongoose.model('Song', SongSchema)

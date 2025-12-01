const mongoose = require('mongoose')
const Schema = mongoose.Schema
/*
    Playlist Model for Playlister

    Before: songs embedded.
    - if song details change, must update all playlists. 
    - same song data duplicated / delete song requires searching all playlist
    Now: songs referenced. 
    - Song data stored in Song collection
    - Update song and change everywhere / delete - automatically removes from playlists

*/
const playlistSchema = new Schema(
    {
        name: { type: String, required: true , trim: true},
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true},
        ownerEmail: { type: String, required: true },
        //Song referenced
        songs: [{
            type: Schema.Types.ObjectId,
            ref: 'Song'
        }],
        //Track distinct listeners who have played the playlist 
        listeners:[{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    { timestamps: true }
)

playlistSchema.index({name: 1, owner: 1}, {unique: true})
module.exports = mongoose.model('Playlist', playlistSchema)

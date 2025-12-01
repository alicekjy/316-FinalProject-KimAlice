const mongoose = require('mongoose')
const Schema = mongoose.Schema
/*
    This is where we specify the format of the data we're going to put into
    the database.

    - Each playlist has unique name per owner
    - Store ordered array of Song references
    - Track distinct listeners who have played the playlist 
*/
const playlistSchema = new Schema(
    {
        name: { type: String, required: true , trim: true},
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true},
        ownerEmail: { type: String, required: true },
        songs: [{
            type: Schema.Types.ObjectId,
            ref: 'Song'
        }],
        listeners:[{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    { timestamps: true }
)

playlistSchema.index({name: 1, owner: 1}, {unique: true})
module.exports = mongoose.model('Playlist', playlistSchema)

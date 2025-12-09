const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

async function clearCollection(collection, collectionName) {
    try {
        await collection.deleteMany({});
        console.log(collectionName + " cleared");
    }
    catch (err) {
        console.log(err);
    }
}

async function fillCollectionWithMapping(collection, collectionName, data, mapping) {
    const createdDocs = [];
    for (let i = 0; i < data.length; i++) {
        // Apply mapping if provided (for references)
        const docData = mapping ? mapping(data[i], createdDocs) : data[i];
        let doc = new collection(docData);
        const saved = await doc.save();
        createdDocs.push(saved);
    }
    console.log(collectionName + " filled with " + createdDocs.length + " documents");
    return createdDocs;
}

async function resetMongo() {
    const User = require('../../../models/user-model');
    const Song = require('../../../models/song-model');
    const Playlist = require('../../../models/playlist-model');
    const testData = require('../example-db-data.json');

    console.log("Resetting the Mongo DB");
    
    // Clear all collections
    await clearCollection(Playlist, "Playlist");
    await clearCollection(Song, "Song");
    await clearCollection(User, "User");

    // Fill Users
    const createdUsers = await fillCollectionWithMapping(User, "User", testData.users);

    // Fill Songs (with addedBy reference to first user)
    const createdSongs = await fillCollectionWithMapping(Song, "Song", testData.songs, (songData) => ({
        ...songData,
        addedBy: createdUsers[0]._id
    }));

    // Fill Playlists (with owner and song references)
    await fillCollectionWithMapping(Playlist, "Playlist", testData.playlists, (playlistData) => {
        const owner = createdUsers.find(u => u.email === playlistData.ownerEmail);
        const songIds = playlistData.songIndices.map(idx => createdSongs[idx]._id);
        
        return {
            name: playlistData.name,
            owner: owner._id,
            ownerEmail: owner.email,
            songs: songIds,
            playedBy: []
        };
    });

    // Update song playlist counts
    console.log("Updating song playlist counts...");
    for (const song of createdSongs) {
        const count = await Playlist.countDocuments({ songs: song._id });
        await Song.findByIdAndUpdate(song._id, { numPlaylists: count });
    }
    console.log("Song playlist counts updated");

    console.log("Database reset complete!");
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Songs: ${createdSongs.length}`);
    console.log(`- Playlists: ${testData.playlists.length}`);
}

const mongoose = require('mongoose');
mongoose
    .connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => { 
        await resetMongo();
        console.log("\nDisconnecting...");
        await mongoose.disconnect();
        console.log("Done!");
        process.exit(0);
    })
    .catch(e => {
        console.error('Connection error', e.message);
        process.exit(1);
    });
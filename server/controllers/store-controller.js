const auth = require('../auth')
/*
    Playlist controller for playlister
    Handles: CreatePlaylist, Edit Playlist, Copy Playlist, Delete Playlist
    Play Playlist, Find Playlist (search), sort playlist, add song to playlist
*/
// Create Playlist - 2.7
createPlaylist = async (req, res) => {
    try{
        const userId = auth.verifyUser(req);
        if(!userId){
            return res.status(401).json({
                errorMessage: 'Unauthorized'
            });
        }
        const db = req.app.locals.db;
        const user = await db.findUserById(userId);

        if(!user){
            return res.status(404).json({
                errorMessage: 'User not found'
            });
        }
        //Generate unique Untitled n name
        const userPlaylists = await db.findPlaylistsByOwner(userId);
        let untitledNumber = 0;
        let playlistName = `Untitled ${untitledNumber}`;

        //next available untitled number
        while (userPlaylists.some(p=> p.name === playlistName)){
            untitledNumber++;
            playlistName = `Untitled ${untitledNumber}`;
        }

        //create playlist
        const newPlaylist = await db.createPlaylist({
            name: playlistName,
            owner: userId,
            ownerEmail: user.email,
            songs: [],
            playedBy: []
        });
        return res.status(201).json({
            success: true,
            playlist: newPlaylist
        });
    }catch(error){
        console.error('Error creating playlist: ', error);
        return res.status(500).json({
            errorMessage: 'Error creating playlist'
        });
    }
}
//Edit playlist - update name or songs - 2.8
updatePlaylist = async(req, res) => {
    try{
        const userId = auth.verifyUser(req);
        if(!userId){
            return res.status(401).json({
                errorMessage: 'Unauthorized'
            });
        }

        const db = req.app.locals.db;
        const playlist = await db.findPlaylistById(req.params.id);

        if(!playlist){
            return res.status(404).json({
                errorMessage: 'Playlist not found'
            });
        }

        //check ownership
        if(playlist.owner._id.toString() !== userId.toString()){
            return res.status(403).json({
                errorMessage: 'You can only edit your own playlists'
            });
        }
        const {name, songs} = req.body; 

        //if name is being changed, check uniqueness for this user
        if(name && name !== playlist.name){
            const userPlaylists = await db.findPlaylistsByOwner(userId);
            if(userPlaylists.some(p => p.name === name && p._id.toString() !==req.params.id)){
                return res.status(400).json({
                    errorMessage: 'You already have a playlist with this name'
                });
            }
        }

        //update playlist
        let updateData = {};
        if(name) updateData.name = name;
        if (songs !== undefined ) updateData.songs = songs;

        const updatedPlaylist = await db.updatePlaylist(req.params.id, updateData);
        //updated numPlaylists for each song
        if(songs !== undefined){
            for(let songId of songs){
                await db.updateSongPlaylistCount(songId);
            }
        }
        return res.status(200).json({
            success: true,
            playlist: updatedPlaylist
        });
    }catch(error){
        console.error('Error updating playlist: ', error);
        return res.status(500).json({
            errorMessage: 'Error updating playlist'
        });
    }
}
//copy playlist - 2.9
copyPlaylist = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                errorMessage: 'Unauthorized'
            });
        }

        const db = req.app.locals.db;
        const originalPlaylist = await db.findPlaylistById(req.params.id);

        if (!originalPlaylist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found'
            });
        }

        const user = await db.findUserById(userId);

        const userPlaylists = await db.findPlaylistsByOwner(userId);
        
        // Create copy name
        let copyName = `${originalPlaylist.name} - Copy`;
        let copyNumber = 1;

        // Ensure unique name - check if any playlist has this name
        while (userPlaylists.some(playlist => playlist.name === copyName)) {
            copyNumber++;
            copyName = `${originalPlaylist.name} - Copy ${copyNumber}`;
        }

        // Extract song IDs
        const songIds = originalPlaylist.songs.map(song => {
            if (typeof song === 'object' && song._id) {
                return song._id;
            }
            return song;
        });

        // Deep copy: create new playlist with same songs
        const copiedPlaylist = await db.createPlaylist({
            name: copyName,
            owner: userId,
            ownerEmail: user.email,
            songs: songIds,
            playedBy: []
        });

        // Update playlist counts for songs
        for (let songId of songIds) {
            await db.updateSongPlaylistCount(songId);
        }

        return res.status(201).json({
            success: true,
            playlist: copiedPlaylist
        });

    } catch (error) {
        console.error('Error copying playlist:', error);
        return res.status(500).json({
            errorMessage: 'Error copying playlist',
            details: error.message
        });
    }
}
//delete playlist - 2.10
deletePlaylist = async (req, res) => {
    try{
        const userId = auth.verifyUser(req);
        if(!userId){
            return res.status(401).json({
                errorMessage: 'Unauthorized'
            });
        }
        const db = req.app.locals.db;
        const playlist = await db.findPlaylistById(req.params.id);

        if(!playlist){
            return res.status(404).json({
                errorMessage: 'Playlist not found'
            });
        }
        //check ownership
        if(playlist.owner._id.toString() !== userId.toString()){
            return res.status(403).json({
                errorMessage: 'You can only delete your own playlist'
            });
        }

        //store song Ids before deletion
        const songIds = playlist.songs.map(s => s._id);
        //delete playlist
        await db.deletePlaylist(req.params.id);
        //update playlist counts for affected songs
        for (let songId of songIds){
            await db.updateSongPlaylistCount(songId);
        }
        return res.status(200).json({
            success: true, 
            message: 'Playlist deleted successfully'
        });
    }catch(error){
        console.error('Error deleting playlist:', error);
        return res.status(500).json({
            errorMessage: 'Error deleting playlist'
        });
    }
}
//play playlist - 2.11
playPlaylist = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);
        const db = req.app.locals.db;
        
        const playlist = await db.findPlaylistById(req.params.id);

        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found'
            });
        }

        //add listener if logged in
        if (userId) {
            await db.addListener(req.params.id, userId);
        }
        //increment listen count for each song
        for (let song of playlist.songs) {  
            await db.incrementSongListens(song._id);
        }
        return res.status(200).json({
            success: true,
            playlist: playlist
        });

    } catch (error) {
        console.error('Error playing playlist:', error);
        return res.status(500).json({
            errorMessage: 'Error playing playlist',
            details: error.message
        });
    }
}
// find playlists with sorting 2.12 & 2.13
getPlaylists = async (req,res) =>{
    try{
        const userId = auth.verifyUser(req);
        const db = req.app.locals.db;
        const{
            playlistName, ownerUsername, songTitle, songArtist, songYear,
            sortBy, sortOrder
        } = req.query ;
        let playlists;
        //if no filters, show owned playlists for logged-in users
        if(!playlistName && !ownerUsername && !songTitle && !songArtist && !songYear){
            if(userId){
                playlists = await db.findPlaylistsByOwner(userId);
            }else{
                playlists = await db.getAllPlaylists();
            }
        }else{
            //search with filters
            const filters = {};
            if(playlistName) filters.playlistName = playlistName;
            if(ownerUsername) filters.ownerUsername = ownerUsername;
            if(songTitle) filters.songTitle = songTitle;
            if(songArtist) filters.songArtist = songArtist;
            if(songYear) filters.songYear = songYear;

            playlists = await db.searchPlaylists(filters);
        }

        //sort if requested
        if(sortBy){
            playlists = sortPlaylists(playlists, sortBy, sortOrder);
        }
        return res.status(200).json({
            success: true, playlists: playlists
        });
    }catch(error){
        console.error('Error getting playlists: ', error);
        return res.status(500).json({
            errorMessage: 'Error retrieving playlists'
        })
    }
}
//get single playlist by ID
getPlaylistById = async (req, res) => {
    try{
        const userId = auth.verifyUser(req);
        if(!userId){
            return res.status(401).json({
                errorMessage: 'Unauthorized'
            });
        }
        const db = req.app.locals.db;
        const playlist = await db.findPlaylistById(req.params.id);
        
        if(!playlist){
            return res.status(404).json({
                errorMessage: 'Playlist not found'
            });
        }
        //check ownership
        if (playlist.owner._id.toString() !== userId.toString()) {
            return res.status(403).json({
                errorMessage: 'You can only view your own playlists'
            });
        }

        return res.status(200).json({
            success: true,
            playlist: playlist
        });
    }catch (error){
        console.error('Error getting playlist:', error);
        return res.status(500).json({
            errorMessage: 'Error retrieving playlist'
        });
    }
}
//get playlist pairs (id,name) for dropdown
getPlaylistPairs = async (req, res) => {
    try{
        const userId = auth.verifyUser(req);
        if(!userId){
            return res.status(401).json({
                errorMessage: 'Unauthorized'
            });
        }
        const db = req.app.locals.db;
        const playlists = await db.findPlaylistsByOwner(userId);
        //convert to id/name pairs
        const pairs = playlist.map(playlist => ({
            _id: playlist._id,
            name: playlist.name
        }));

        return res.status(200).json({
            success: true, idNamePairs: pairs
        });
    }catch(error){
        console.error('Error getting playlist pairs: ', error);
        return res.status(500).json({
            errorMessage: 'Error retrieving playlists'
        });
    } 
}
//Add song to playlist - 2.14 
addSongToPlaylist = async (req,res) =>{
    try{
        const userId = auth.verifyUser(req);
        if(!userId){
            return res.status(401).json({
                errorMessage: 'Unauthorized'
            });
        }
        const {playlistId, songId} = req.body;
        if(!playlistId || !songId){
            return res.status(400).json({
                errorMessage: 'playlistId and songId are required'
            });
        }
        const db = req.app.locals.db;
        const playlist = await db.findPlaylistById(playlistId);

        if(!playlist){
            return res.status(404).json({
                errorMessage: 'Playlist not found'
            });
        }
        //check ownership
        if(playlist.owner._id.toString() !== userId.toString()){
            return res.status(403).json({
                errorMessage: 'You can only add songs to your own playlists'
            });
        }
        //check if song exists
        const song = await db.findSongById(songId);
        if(!song){
            return res.status(404).json({
                errorMessage: 'Song not found'
            });
        }
        //add song to playlist if not already there
        const songIds = playlist.songs.map(s=> s._id.toString());
        if(!songIds.includes(songId)){
            songIds.push(songId);
            await db.updatePlaylist(playlistId, {songs: songIds});
            //update song's playlist count
            await db.updateSongPlaylistCount(songId);
        }
        const updatedPlaylist = await db.findPlaylistById(playlistId);
        return res.status(200).json({
            success: true, playlist: updatedPlaylist
        });
    }catch (error){
        console.error('Error adding song to playlist:', error);
        return res.status(500).json({
            errorMessage: 'Error adding song to playlist'
        });
    }
}
//helper function to sort playlists
function sortPlaylists(playlists, sortBy, sortOrder = 'desc'){
    const order = sortOrder === 'asc' ? 1 : -1;

    return playlists.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'listeners':
                comparison = a.playedBy.length - b.playedBy.length;
                break;
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'owner':
                const ownerA = a.owner.username || a.ownerEmail;
                const ownerB = b.owner.username || b.ownerEmail;
                comparison = ownerA.localeCompare(ownerB);
                break;
            default:
                return 0;
        }

        return comparison * order;
    });
}
module.exports = {
    createPlaylist,
    updatePlaylist,
    copyPlaylist,
    deletePlaylist,
    playPlaylist,
    getPlaylists,
    getPlaylistById,
    getPlaylistPairs,
    addSongToPlaylist
}
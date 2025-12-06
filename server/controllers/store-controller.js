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
            listeners: []
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

deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
    
    try {
        const playlist = await dbManager.findPlaylistById(req.params.id);
        console.log("playlist found: " + JSON.stringify(playlist));
        
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found!',
            })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await dbManager.findUserByEmail(playlist.ownerEmail);
        console.log("user._id: " + user._id);
        console.log("req.userId: " + req.userId);
        
        if (user._id == req.userId) {
            console.log("correct user!");
            await dbManager.deletePlaylist(req.params.id);
            return res.status(200).json({});
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ 
                errorMessage: "authentication error" 
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ 
            errorMessage: "Error deleting playlist" 
        });
    }
}
getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    try {
        const list = await dbManager.findPlaylistById(req.params.id);
        
        if (!list) {
            return res.status(400).json({ 
                success: false, 
                error: 'Playlist not found' 
            });
        }
        
        console.log("Found list: " + JSON.stringify(list));

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await dbManager.findUserByEmail(list.ownerEmail);
        console.log("user._id: " + user._id);
        console.log("req.userId: " + req.userId);
        
        if (user._id == req.userId) {
            console.log("correct user!");
            return res.status(200).json({ success: true, playlist: list })
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ 
                success: false, 
                description: "authentication error" 
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ 
            success: false, 
            error: 'Error getting playlist' 
        });
    }
}
getPlaylistPairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("getPlaylistPairs");
    
    try {
        const user = await dbManager.findUserById(req.userId);
        console.log("find user with id " + req.userId);
        console.log("find all Playlists owned by " + user.email);
        
        const playlists = await dbManager.findPlaylistsByOwnerEmail(user.email);
        console.log("found Playlists: " + JSON.stringify(playlists));
        
        if (!playlists || playlists.length === 0) {
            console.log("!playlists.length");
            return res
                .status(404)
                .json({ success: false, error: 'Playlists not found' })
        }
        
        console.log("Send the Playlist pairs");
        // PUT ALL THE LISTS INTO ID, NAME PAIRS
        let pairs = [];
        for (let key in playlists) {
            let list = playlists[key];
            let pair = {
                _id: list._id,
                name: list.name
            };
            pairs.push(pair);
        }
        return res.status(200).json({ success: true, idNamePairs: pairs })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ 
            success: false, 
            error: 'Error getting playlist pairs' 
        });
    }
}
getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    try {
        const playlists = await dbManager.getAllPlaylists();
        
        if (!playlists || playlists.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: `Playlists not found` })
        }
        return res.status(200).json({ success: true, data: playlists })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ 
            success: false, 
            error: 'Error getting playlists' 
        });
    }
}
updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body
    console.log("updatePlaylist: " + JSON.stringify(body));

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    try {
        const playlist = await dbManager.findPlaylistById(req.params.id);  
        console.log("playlist found: " + JSON.stringify(playlist));
        
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found!',
            })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await dbManager.findUserByEmail(playlist.ownerEmail); 
        console.log("user._id: " + user._id);
        console.log("req.userId: " + req.userId);
        
        if (user._id == req.userId) {
            console.log("correct user!");

            const updatedPlaylist = await dbManager.updatePlaylist(req.params.id, {  // ✅ New dbManager code
                name: body.playlist.name,
                songs: body.playlist.songs
            });
            
            console.log("SUCCESS!!!");
            return res.status(200).json({
                success: true,
                id: updatedPlaylist._id,
                message: 'Playlist updated!',
            })
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ 
                success: false, 
                description: "authentication error" 
            });
        }
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        return res.status(404).json({
            error,
            message: 'Playlist not updated!',
        })
    }
}
module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}
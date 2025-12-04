const auth = require ('../auth')

/**
 * Song controller for final project
 * Sort, add, edit, remove song
 */

//Add Song to Catalog - 2.16
createSong = async (req, res) => {
    try{
        const userId = auth.verifyUser(req);
        if(!userId){
            return res.status(401).json({
                errorMessage: 'Unauthorized'
            });
        }
        const {title, artist, year, youtubeId} = req.body;

        //validate
        if(!title||!artist || !year || !youtubeId){
            return res.status(400).json({
                errorMessage: 'All fields are required (title, artist, year, youtubeId)'
            });
        }
        const db = req.app.locals.db;
        // Check if song already exists 
        const existingSong = await db.findSongByDetails(title,artist,parseInt(year));
        if(existingSong){
            return res.status(400).json({
                errorMessage: 'A song with this title, year, artist already exists.'
            });
        }
        //create the song
        const newSong = await db.createSong({
            title, artist,
            year: parseInt(year),
            youtubeId,
            addedBy: userId
        });
        return res.status(201).json({
            success: true, song: newSong
        });
    } catch (error){
        console.error('Error creating song: ', error);
        return res.status(500).json({
            errorMessage: 'Error creating song'
        });
    }
}

//get all songs || songs added by current user
getSongs = async (req, res) =>{
    try {
        const userId = auth.verifyUser(req);
        const db = req.app.locals.db;

        let songs;
        if(userId){
            //if logged in - get songs added by this user by default
            songs = await db.findSongsByAddedBy(userId);
        }else{
            //Guest user - return all songs
            songs = await db.getAllSongs();
        }
        return res.status(200).json({
            success: true,
            songs: songs
        });
    }catch (error){
        console.error('Error getting songs: ', error);
        return res.status(500).json({
            errorMessage: 'Error retrieving songs'
        });
    }
}
//get single song by ID
getSongById = async(req, res) =>{
    try{
        const db = req.app.locals.db;
        const song = await db.findSongById(req.params.id);

        if(!song){
            return res.status(404).json({
                errorMessage: 'Song not found'
            });
        }
        return res.status(200).json({
            success: true, song: song
        });
    }catch(error){
        console.error('Error getting song: ', error);
        return res.status(500).json({
            errorMessage: 'Error retrieving song'
        });
    }
}

//Search songs - 2.15 - sorting added
searchSongs = async (req, res) => {
    try{
        const db = req.app.locals.db;
        const {title, artist, year, sortBy, sortOrder} = req.query;

        let filters = {};
        if(title) filters.title = title;
        if(artist) filters.artist = artist;
        if(year) filters.year = year;

        let songs = await db.searchSongs(filters);

        if(sortBy){
            songs = sortSongs(songs, sortBy, sortOrder);
        }
        return res.status(200).json({
            success: true,
            songs: songs
        });
    }catch(error){
        console.error('Error searching songs: ', error);
        return res.status(500).json({
            errorMessage: 'Error searching songs'
        });
    }
}

//Edit song - 2.17
updateSong = async(req, res) =>{
    try{
        const userId = auth.verifyUser(req);
        if(!userId){
            return res.status(401).json({
                errorMessage: 'Unauthorized'
            });
        }
        const db = req.app.locals.db;
        const song = await db.findSongsById(req.params.id);

        if(!song){
            return res.status(404).json{
                errorMessage: 'Song not found'
            };
        }
        //check if user owns this song -only owner can edit
        if(song.addedBy._id.toString()!== userId.toString()){
            return res.status(403).json({
                errorMessage: 'You can only edit songs you added'
            });
        }
        const {title, artist, year, youtubeId} = req.body;
        //validate
        if(!title || !artist || !year || !youtubeId){
            return res.status(400).json({
                errorMessage: 'All fields are required'
            });
        }
        const updatedSong = await db.updateSong(req.params.id,{
            title, artist, year: parseInt(year), youtubeId
        });
        return res.status(200).json({
            success: true, song: updatedSong
        });
    } catch (error){
        console.error('Error updating song: ', error);
        return res.status(500).json({
            errorMessage: 'Error updating song'
        });
    }
}


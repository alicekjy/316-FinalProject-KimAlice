
const DatabaseManager = require('../index')
const mongoose = require('mongoose')
//add song
class MongoDBManager extends DatabaseManager{
    constructor(){
        super();
        this.User = null;
        this.Playlist = null;
        this.Song = null; 
        this.isConnected = false;
    }
    async connect() {
        try {
            if (!this.isConnected) {
                await mongoose.connect(process.env.DB_CONNECT, { 
                    useNewUrlParser: true,
                    useUnifiedTopology: true 
                });
                this.User = require('../../models/user-model');
                this.Playlist = require('../../models/playlist-model');
                this.Song = require('../../models/song-model');
                
                this.isConnected = true;
                console.log('MongoDB connected successfully');
            }
            return this.isConnected;
        } catch (error) {
            console.error('MongoDB connection error:', error.message);
            throw error;
        }
    }
    async disconnect(){
        try{
            await mongoose.disconnect();
            this.isConnected = false;
            console.log('MongoDB disconnected.')
        } catch (error){
            console.error('MongoDB disconnection error: ', error.message);
            throw error; 
        }
    }

    //User methods
    //2.1 create account
    async createUser(userData){
        try {
            const newUser = new this.User(userData);  
            const savedUser = await newUser.save();
            return savedUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    //2.2 login, 2.4 check logged in
    async findUserById(userId) {
        try {
            const user = await this.User.findOne({ _id: userId });
            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }
    //2.2 login
    async findUserByEmail(email) {
        try {
            const user = await this.User.findOne({ email: email });
            return user;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }
    //2.3 edit account
    async updateUser(userId, userData){
        try{
            const user = await this.User.findById(userId);
            if(!user){
                throw new Error('User not found');
            }
            //Update fields
            if(userData.username) user.username = userData.username;
            if(userData.passwordHash) user.passwordHash = userData.passwordHash;
            if(userData.avatar) user.avatar = userData.avatar;
            //email cannot be changed per spec

            const savedUser = await user.save();
            return savedUser;
        }catch(error){
            console.error('Error updating user: ', error);
            throw error;
        }
    }
    //Playlist methods
    //2.7 create playlist
    async createPlaylist(playlistData){
        try{
            const newPlaylist = new this.Playlist(playlistData);
            const savedPlaylist = await newPlaylist.save();
            return savedPlaylist;
        }catch(error){
            console.error('Error creating playlist: ', error);
            throw error; 
        }
    }
    //2.8 edit, 2.10 delete, 2.11 play
    async findPlaylistById(playlistId){
        try{
            const playlist = await this.Playlist.findById({ _id: playlistId})
            .populate('songs')
            .populate('owner', 'username email avatar');
            return playlist;
        } catch (error){
            console.error('Error finding playlist by ID: ', error);
            throw error;
        }
    }
    //show my playlists
    async findPlaylistsByOwner(ownerId) {
        try {
            const playlists = await this.Playlist.find({ owner: ownerId })
                .populate('songs')
                .sort({ updatedAt: -1 });
            return playlists;
        } catch (error) {
            console.error('Error finding playlists by owner:', error);
            throw error; 
        }
    }
    //same but search by email, backward compatibility
    async findPlaylistsByOwnerEmail(ownerEmail){
        try{
            const playlists = await this.Playlist.find({ownerEmail: ownerEmail})
                .populate('songs')
                .sort({updatedAt: -1});
            return playlists;
        } catch (error){
            console.error('Error finding playlists by owner email: ', error);
            throw error; 
        }
    }
    //2.8 edit playlist
    async updatePlaylist(playlistId, playlistData) {
        try {
            const playlist = await this.Playlist.findById(playlistId);
            if (!playlist) {
                throw new Error('Playlist not found');
            }
            
            if (playlistData.name) playlist.name = playlistData.name;
            if (playlistData.songs !== undefined) playlist.songs = playlistData.songs;

            const savedPlaylist = await playlist.save();
            return savedPlaylist;
        } catch (error) {
            console.error('Error updating playlist:', error);
            throw error;
        }
    }
    //2.10 delete playlist
    async deletePlaylist(playlistId) {
        try {
            const deletedPlaylist = await this.Playlist.findOneAndDelete({ _id: playlistId });
            return deletedPlaylist;
        } catch (error) {
            console.error('Error deleting playlist:', error);
            throw error;
        }
    }
    //guest mode 2.5 guest browsing
    async getAllPlaylists() {
        try {
            const playlists = await this.Playlist.find({})
                .populate('songs')
                .populate('owner', 'username email avatar')
                .sort({updatedAt : -1});
            return playlists;
        } catch (error) {
            console.error('Error getting all playlists:', error);
            throw error;
        }
    }
    //2.12 find playlist
    async searchPlaylists(filters) {
        try {
            let query = {};
            
            // Build query based on filters
            if (filters.playlistName) {
                query.name = { $regex: filters.playlistName, $options: 'i' };
            }
            
            if (filters.ownerUsername) {
                //find users matching the username
                const users = await this.User.find({
                    username: { $regex: filters.ownerUsername, $options: 'i' }
                });
                const userIds = users.map(u => u._id);
                query.owner = { $in: userIds };
            }

            let playlists = await this.Playlist.find(query)
                .populate('songs')
                .populate('owner', 'username email avatar');

            // Filter by song - title, artist, year if provided
            if (filters.songTitle || filters.songArtist || filters.songYear) {
                playlists = playlists.filter(playlist => {
                    return playlist.songs.some(song => {
                        let match = true;
                        if (filters.songTitle) {
                            match = match && song.title.toLowerCase().includes(filters.songTitle.toLowerCase());
                        }
                        if (filters.songArtist) {
                            match = match && song.artist.toLowerCase().includes(filters.songArtist.toLowerCase());
                        }
                        if (filters.songYear) {
                            match = match && song.year === parseInt(filters.songYear);
                        }
                        return match;
                    });
                });
            }

            return playlists;
        } catch (error) {
            console.error('Error searching playlists:', error);
            throw error;
        }
    }
    //2.11 play playlist
    async addListener(playlistId, userId){
        try{
            const playlist = await this.Playlist.findById(playlistId);
            if(!playlist){
                throw new Error('Playlist not found');
            }

            //add user to listeners if not already there
            if(!playlist.listeners.includes(userId)){
                playlist.listeners.push(userId);
                await playlist.save();
            }
            return playlist;
        } catch (error){
            console.error('Error adding listener: ', error);
            throw error; 
        }
    }
    //Song methods
    /**
     * create Song, find Song by Id, find Song by Details
     * find Songs by Added By, get All Songs
     * search Songs, update Song, delete Song, increment Song Listens
     * update Song Playlist Count
     */
    //2.16 add song to catalog
    async createSong(songData){
        try{
            const newSong = new this.Song(songData);
            const savedSong = await newSong.save();
            return savedSong; 
        }catch (error){
            console.error('Error creating song: ', error);
            throw error;
        }
    }
    //display song details
    async findSongById(songId){
        try{
            const song = await this.Song.findById(songId)
                .populate('addedBy', 'username email');
            return song;
        }catch(error){
            console.error('Error finding song by ID: ', error);
            throw error;
        }
    }
    //2.16 prevent duplicates, check if song exists
    async findSongByDetails(title, artist, year){
        try{
            const song = await this.Song.findOne({
                title: title,
                artist: artist,
                year: year
            });
            return song;
        }catch (error){
            console.error('Error finding song by details: ', error);
            throw error;
        }
    }
    //show my songs, get songs user added 
    async findSongsByAddedBy(userId){
        try{
            const songs = await this.Song.find({ addedBy: userId})
                .sort({createdAt: -1});
            return songs;
        }catch(error){
            console.error('Error finding songs by user: ', error);
            throw error;
        }
    }
    //2.15 browse catalog, guest/logged-in browse all 
    async getAllSongs(){
        try{
            const songs = await this.Song.find({})
                .populate('addedBy', 'username email')
                .sort({createdAt: -1});
            return songs;
        }catch (error){
            console.error('Error getting all songs: ', error);
            throw error;
        }
    }
    //2.15 Find specific songs - search by title/artist/year
    async searchSongs(filters) {
        try {
            let query = {};
            
            if (filters.title) {
                query.title = { $regex: filters.title, $options: 'i' };
            }
            if (filters.artist) {
                query.artist = { $regex: filters.artist, $options: 'i' };
            }
            if (filters.year) {
                query.year = parseInt(filters.year);
            }

            const songs = await this.Song.find(query)
                .populate('addedBy', 'username email');
            return songs;
        } catch (error) {
            console.error('Error searching songs:', error);
            throw error;
        }
    }
    //2.17 edit song
    async updateSong(songId, songData){
        try{
            const song = await this.Song.findById(songId);
            if(!song){
                throw new Error('Song not found');
            }
            if(songData.title) song.title = songData.title;
            if(songData.artist) song.artist = songData.artist;
            if(songData.year) song.year = songData.year;
            if(songData.youtubeId) song.youtubeId = songData.youtubeId;

            const savedSong = await song.save();
            return savedSong;
        }catch (error){
            console.error('Error updating song: ', error);
            throw error;
        }
    }
    //2.18 remove song
    async deleteSong (songId){
        try{
            await this.Playlist.updateMany(
                {songs: songId},
                {$pull: {songs: songId}}
            );
            const deletedSong = await this.Song.findByIdAndDelete(songId);
            return deletedSong;
        }catch(error){
            console.error('Error deleting song: ', error);
            throw error; 
        }
    }
    //2.11 play playlist - track play count
    async incrementSongListens(songId){
        try{
            const song = await this.Song.findByIdAndUpdate(
                songId,
                {$inc: {numListens: 1}},
                {new: true}
            );
            return song;
        }catch (error){
            console.error('Error incrementing song listens: ', error);
            throw error;
        }
    }
    //after adding/removing from playlists
    async updateSongPlaylistCount (songId){
        try{
            //count how many playlists contain this song
            const count = await this.Playlist.countDocuments({songs: songId});

            const song = await this.Song.findByIdAndUpdate(
                songId,
                {numPlaylists: count},
                {new: true}
            );
            return song;
        }catch (error){
            console.error('Error updating song playlist count: ', error);
            throw error; 
        }
    }

    //utility methods
    async clearAllUsers() {
        try {
            await this.User.deleteMany({});
            console.log('All users cleared from MongoDB');
        } catch (error) {
            console.error('Error clearing users:', error);
            throw error;
        }
    }

    async clearAllPlaylists() {
        try {
            await this.Playlist.deleteMany({});
            console.log('All playlists cleared from MongoDB');
        } catch (error) {
            console.error('Error clearing playlists:', error);
            throw error;
        }
    }

    async clearAllSongs(){
        try{
            await this.Song.deleteMany({});
            console.log('All songs cleared from MongoDB');
        }catch (error){
            console.error('Error clearing songs: ', error);
            throw error; 
        }
    }
}
module.exports = MongoDBManager;

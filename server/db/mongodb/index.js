
const DatabaseManager = require('../index')
const mongoose = require('mongoose')
//add song
class MongoDBManger extends DatabaseManager{
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
    async findUserById(userId) {
        try {
            const user = await this.User.findOne({ _id: userId });
            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }
    async findUserByEmail(email) {
        try {
            const user = await this.User.findOne({ email: email });
            return user;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }
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

    async deletePlaylist(playlistId) {
        try {
            const deletedPlaylist = await this.Playlist.findOneAndDelete({ _id: playlistId });
            return deletedPlaylist;
        } catch (error) {
            console.error('Error deleting playlist:', error);
            throw error;
        }
    }
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
}
module.exports = MongoDBManger;

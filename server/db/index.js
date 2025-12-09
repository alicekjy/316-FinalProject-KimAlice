// Class defines the interface for database operations.
// extended by database implementations - mongodb, postgresql
class DatabaseManager{
    constructor(){
        if(new.target === DatabaseManager){
            throw new TypeError("Cannot construct DatabaseManager instances directly.");
        }
    }
    //Connection methods
    async connect(){
        throw new Error("Method connect() must be implemented.");
    }
    async disconnect(){
        throw new Error("Method disconnect() must be implemented.");
    }
    
    //user methods
    async createUser(userData){
        throw new Error("Method createUser() must be implemented.");
    }
    async findUserById(userId){
        throw new Error("Method findUserById() must be implemented.");
    }
    async findUserByEmail(email){
        throw new Error("Method findUserByEmail() must be implemented.");
    }
    async updateUser(userId, userData){
        throw new Error("Method updateUser() must be implemented.");
    }

    //song Methods
    async createSong(songData){
        throw new Error("Method createSong() must be implemented.");
    }
    async findSongById(songId){
        throw new Error("Method findSongById() must be implemented.");
    }
    async findSongByDetails(title, artist, year){
        throw new Error("Method findSongByDetails() must be implemented.");
    }
    async findSongsByAddedBy(userId){
        throw new Error("Method findSongsByAddedBy() must be implemented.");
    }
    async getAllSongs(){
        throw new Error("Method getAllSongs() must be implemented.");
    }
    async searchSongs(filters){
        throw new Error("Method searchSongs() must be implemented.");
    }
    async updateSong(songId, songData){
        throw new Error("Method updateSong() must be implemented.");
    }
    async deleteSong(songId){
        throw new Error("Method deleteSong() must be implemented.");
    }
    async incrementSongListens(songId){
        throw new Error("Method incrementSongListens() must be implemented.");
    }
    async updateSongPlaylistCount(songId){
        throw new Error("Method updateSongPlaylistCount() must be implemented.");
    }

    //playlist Methods
    async createPlaylist(playlistData){
        throw new Error("Method createPlaylist() must be implemented.");
    }
    async findPlaylistById(playlistId){
        throw new Error("Method findPlaylistById() must be implemented.");
    }
    async findPlaylistsByOwner(ownerId){
        throw new Error("Method findPlaylistsByOwner() must be implemented.");
    }
    async findPlaylistsByOwnerEmail(ownerEmail){
        throw new Error("Method findPlaylistsByOwnerEmail() must be implemented.");
    }
    async updatePlaylist(playlistId, playlistData){
        throw new Error("Method updatePlaylist() must be implemented.");
    }
    async deletePlaylist(playlistId){
        throw new Error("Method deletePlaylist() must be implemented.");
    }
    async getAllPlaylists(){
        throw new Error("Method getAllPlaylists() must be implemented.");
    }
    async searchPlaylists(filters){
        throw new Error("Method searchPlaylists() must be implemented.");
    }
    async addListener(playlistId, userId){
        throw new Error("Method addListener() must be implemented.");
    }

    //utility methods
    async clearAllUsers(){
        throw new Error("Method clearAllUsers() must be implemented.");
    }
    async clearAllSongs(){
        throw new Error("Method clearAllSongs() must be implemented.");
    }
    async clearAllPlaylists(){
        throw new Error("Method clearAllPlaylists() must be implemented.");
    }
}

module.exports = DatabaseManager;
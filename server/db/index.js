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
    
    //User methods
    async createUser(userData){
        throw new Error("Method createUser() must be implemented.");
    }
    async findUserById(userId){
        throw new Error("Method findUserById() must be implemented.");
    }
    async findUserByEmail(email){
        throw new Error("Method findUserByEmail() must be implemented.");
    }

    //Playlist Methods
    async createPlaylist(playlistData){
        throw new Error("Method createPlaylist() must be implemented.");
    }
    async findPlaylistById(playlistId){
        throw new Error("Method findPlaylistById() must be implemented.");
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

    //utility method
    async clearAllUsers(){
        throw new Error("Method clearAllUsers() must be implemented.");
    }
    async clearAllPlaylists(){
        throw new Error("Method clearAllPlaylists() must be implemented.");
    }
}

module.exports = DatabaseManager;
//PostgreSQL DatabaseManager Implementation using Sequelize ORM

const DatabaseManager = require('../index')
const {Sequelize, DataTypes } = require('sequelize')

class PostgreSQLManager extends DatabaseManager {
    constructor(){
        super();
        this.sequelize = null;
        this.User = null;
        this.Playlist = null;
        this.UserPlaylist = null;
        this.isConnected = false;
    }
    //define models
    defineModels(){
        this.User = this.sequelize.define('User',{
            id:{
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            firstName:{
                type: DataTypes.STRING,
                allowNull: false
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            passwordHash:{
                type: DataTypes.STRING,
                allowNull: false
            }
        },{
            tableName: 'users',
            timestamps: true
        });
        
        //Playlist Model
        this.Playlist = this.sequelize.define('Playlist',{
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name:{
                type: DataTypes.STRING,
                allowNull: false
            },
            ownerEmail: {
                type: DataTypes.STRING,
                allowNull: false
            },
            songs: {
                type: DataTypes.JSON,
                allowNull: false, 
                defaultValue: []
            }
        },{
            tableName: 'playlists',
            timestamps: true
        });
        //UserPlaylist Junction Table - many to many
        this.UserPlaylist = this.sequelize.define('UserPlaylist',{
            userId:{
                type: DataTypes.INTEGER,
                references:{
                    model: this.User,
                    key: 'id'
                }
            },
            playlistId: {
                type: DataTypes.INTEGER,
                references: {
                    model: this.Playlist,
                    key: 'id'
                }
            }
        },{
            tableName: 'user_playlists',
            timestamps: false
        });
        //Define associations
        this.User.belongsToMany(this.Playlist,{
            through: this.UserPlaylist,
            foreignKey: 'userId',
            as: 'playlists'
        });
        this.Playlist.belongsToMany(this.User, {
            through: this.UserPlaylist,
            foreignKey: 'playlistId',
            as: 'users'
        });
    }

    //Connection Methods
    async connect(){
        try{
            if(!this.isConnected){
                this.sequelize = new Sequelize(
                    process.env.PG_DATABASE,
                    process.env.PG_USER,
                    process.env.PG_PASSWORD || '',
                    {
                        host: process.env.PG_HOST,
                        port: process.env.PG_PORT,
                        dialect: 'postgres',
                        logging: false
                    }
                );
                await this.sequelize.authenticate();
                console.log('PostgreSQL connection established successfully.');
                //define Models
                this.defineModels();
                //sync models with database
                await this.sequelize.sync({alter: true});
                console.log('PostgreSQL models synchronized');
                this.isConnected = true; 
            }
            return this.isConnected;
        }catch(error){
            console.error('PostgreSQL connection error: ', error.message);
            throw error;
        }
    }
    async disconnect(){
        try{
            await this.sequelize.close();
            this.isConnected = false;
            console.log('PostgreSQL disconnected succesfully.');
        }catch(error){
            console.error('PostgreSQL disconnection error: ', error.message);
            throw error;
        }
    }

    //User Methods 
    async createUser(userData){
        try{
            const newUser = await this.User.create({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                passwordHash: userData.passwordHash
            });

            return {
                _id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                passwordHash: newUser.passwordHash,
                playlists: []
            };
        }catch(error){
            console.error('Error creating user: ', error);
            throw error;
        }
    }

    async findUserById(userId){
        try{
            const user = await this.User.findByPk(userId, {
                include: [{
                    model: this.Playlist,
                    as: 'playlists',
                    through: {attributes: [] }
                }]
            });

            if(!user) return null;

            return{
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                passwordHash: user.passwordHash,
                playlists: user.playlists ? user.playlists.map(p => p.id) : []
            };
        }catch (error){
            console.error('Error finding user by ID: ', error);
            throw error; 
        }
    }
    async findUserByEmail(email){
        try{
            const user = await this.User.findOne({
                where: {email : email},
                include: [{
                    model: this.Playlist,
                    as: 'playlists',
                    through: {attributes: []}
                }]
            });
            if(!user) return null;

            return{
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                passwordHash: user.passwordHash,
                playlists: user.playlists ? user.playlists.map(p => p.id) : []
            };
        }catch (error){
            console.error('Error finding user by email: ', error);
            throw error; 
        }
    }

    //PlaylistMethods
    async createPlaylist(playlistData){
        try{
            const newPlaylist = await this.Playlist.create({
                name: playlistData.name,
                ownerEmail: playlistData.ownerEmail,
                songs: playlistData.songs || []
            });
            return {
                _id: newPlaylist.id,
                name: newPlaylist.name,
                ownerEmail: newPlaylist.ownerEmail,
                songs: newPlaylist.songs
            };
        } catch (error){
            console.error('Error creating playlist: ', error);
            throw error;
        }
    }
    async findPlaylistById(playlistId){
        try{
            const playlist = await this.Playlist.findByPk(playlistId);
            if(!playlist) return null;

            return{
                _id: playlist.id,
                name: playlist.name,
                ownerEmail: playlist.ownerEmail,
                songs: playlist.songs
            };
        } catch (error){
            console.error('Error finding playlist by ID: ', error);
            throw error;
        }
    }

    async findPlaylistsByOwnerEmail(ownerEmail){
        try{
            const playlists = await this.Playlist.findAll({
                where: { ownerEmail : ownerEmail}
            });

            return  playlists.map(playlist => ({
                _id: playlist.id,
                name: playlist.name,
                ownerEmail: playlist.ownerEmail,
                songs: playlist.songs
            }));
        }catch (error){
            console.error('Error finding playlists by owner: ', error);
            throw error;
        }
    }
    async updatePlaylist(playlistId, playlistData) {
        try {
            const playlist = await this.Playlist.findByPk(playlistId);
            if (!playlist) {
                throw new Error('Playlist not found');
            }
            
            await playlist.update({
                name: playlistData.name,
                songs: playlistData.songs
            });
            
            return {
                _id: playlist.id,
                name: playlist.name,
                ownerEmail: playlist.ownerEmail,
                songs: playlist.songs
            };
        } catch (error) {
            console.error('Error updating playlist:', error);
            throw error;
        }
    }
    async deletePlaylist(playlistId){
        try{
            const playlist = await this.Playlist.findByPk(playlistId);
            if(!playlist){
                throw new Error('Playlist not found')
            }
            await playlist.destroy();
            return{_id: playlistId};
        }catch (error){
            console.error('Error deleting playlist: ', error);
            throw error;
        }
    }
    async getAllPlaylists(){
        try{
            const playlists = await this.Playlist.findAll();
            return playlists.map(playlist => ({
                _id: playlist.id,
                name: playlist.name,
                ownerEmail: playlist.ownerEmail,
                songs: playlist.songs
            }));
        }catch (error){
            console.error('Error getting all playlists: ', error);
            throw error
        }
    }
    //utility
    async clearAllUsers(){
        try{
            await this.User.destroy({where: {}});
            console.log('All users cleared from PostgreSQL.');
        }catch(error){
            console.error(error);
            throw error;
        }
    }
    async clearAllPlaylists(){
        try{
            await this.Playlist.destroy({where: {}});
            console.log('All playlists cleared from PostgreSQL');
        }catch (error){
            console.error(error);
            throw error;
        }
    }
}

module.exports = PostgreSQLManager;
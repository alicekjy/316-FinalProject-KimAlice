
import { beforeAll,beforeEach,afterEach,afterAll,expect,test,describe,} from 'vitest';
  
  import path from 'path';
  import dotenv from 'dotenv';
  import dbManager from '../db/loader.js';
  import testData from './data/example-db-data.json';
  
  // Use CWD so it works from Vitest (no __dirname in ESM)
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  

let createdUsers = [];
let createdSongs = [];

/**
 * Seeds the database with test data
 * Creates all users /creates all songs 
 * creates all playlists with song references/ updates song playlist counts
 */
async function seedDatabase() {

    createdUsers = [];
    createdSongs = [];

    await dbManager.clearAllPlaylists();
    await dbManager.clearAllSongs();
    await dbManager.clearAllUsers();

    for (const userData of testData.users) {
        const user = await dbManager.createUser(userData);
        createdUsers.push(user);
    }

    for (const songData of testData.songs) {
        const song = await dbManager.createSong({
            ...songData,
            addedBy: createdUsers[0]._id 
        });
        createdSongs.push(song);
    }

    for (const playlistData of testData.playlists) {
        const owner = createdUsers.find(u => u.email === playlistData.ownerEmail);
        if (!owner) {
            console.warn(`Owner not found for playlist: ${playlistData.name}, email: ${playlistData.ownerEmail}`);
            continue;
        }
        
        const songIds = playlistData.songIndices.map(idx => createdSongs[idx]._id);
        
        await dbManager.createPlaylist({
            name: playlistData.name,
            owner: owner._id,
            ownerEmail: owner.email,
            songs: songIds,
            playedBy: []
        });
    }

    for (const song of createdSongs) {
        await dbManager.updateSongPlaylistCount(song._id);
    }
}

//Executed once before all tests are performed.
beforeAll(async () => {
    await dbManager.connect();
    await seedDatabase();
});

//Executed before each test is performed.
beforeEach(async () => {
    await seedDatabase();
});

//Executed after each test is performed.
afterEach(() => {
});

//Executed once after all tests are performed.
afterAll(async () => {
    await dbManager.clearAllPlaylists();
    await dbManager.clearAllSongs();
    await dbManager.clearAllUsers();
    await dbManager.disconnect();
});

//user test
describe('User Operations', () => {
    test('Test #1) Connecting to the Database', async () => {
        const connected = await dbManager.connect();
        expect(connected).toBeTruthy();
    });

    test('Test #2) Disconnecting and Reconnecting to the Database', async () => {
        await dbManager.disconnect();
        const reconnected = await dbManager.connect();
        expect(reconnected).toBeTruthy();
        await seedDatabase();
    });

    test('Test #3) Creating a User', async () => {
        const newUser = {
            username: 'NewTestUser',
            email: 'newtest@example.com',
            passwordHash: '$2a$10$testHash123456789012345678901234567890123456',
            avatar: ''
        };

        const createdUser = await dbManager.createUser(newUser);
        expect(createdUser).toBeDefined();
        expect(createdUser.email).toBe(newUser.email);
        expect(createdUser.username).toBe(newUser.username);
    });

    test('Test #4) Finding a User by Email', async () => {
        const user = await dbManager.findUserByEmail(testData.users[0].email);
        expect(user).not.toBeNull();
        expect(user.username).toBe(testData.users[0].username);
    });

    test('Test #5) Finding a User by ID', async () => {
        const userByEmail = await dbManager.findUserByEmail(testData.users[0].email);
        const userById = await dbManager.findUserById(userByEmail._id);
        
        expect(userById).not.toBeNull();
        expect(userById.email).toBe(testData.users[0].email);
    });

    test('Test #6) Updating a User', async () => {
        const user = await dbManager.findUserByEmail(testData.users[0].email);
        const updatedUser = await dbManager.updateUser(user._id, {
            username: 'UpdatedUsername'
        });
        
        expect(updatedUser.username).toBe('UpdatedUsername');
    });
});

//song test 
describe('Song Operations', () => {
    test('Test #7) Creating a Song', async () => {
        const newSong = {
            title: 'Brand New Song',
            artist: 'Brand New Artist',
            year: 2024,
            youtubeId: 'brandnew123',
            addedBy: createdUsers[0]._id
        };

        const createdSong = await dbManager.createSong(newSong);
        expect(createdSong).toBeDefined();
        expect(createdSong.title).toBe(newSong.title);
        expect(createdSong.artist).toBe(newSong.artist);
    });

    test('Test #8) Finding a Song by ID', async () => {
        const song = await dbManager.findSongById(createdSongs[0]._id);
        expect(song).not.toBeNull();
        expect(song.title).toBe(testData.songs[0].title);
    });

    test('Test #9) Finding a Song by Details', async () => {
        const song = await dbManager.findSongByDetails(
            testData.songs[0].title,
            testData.songs[0].artist,
            testData.songs[0].year
        );
        
        expect(song).not.toBeNull();
        expect(song.youtubeId).toBe(testData.songs[0].youtubeId);
    });

    test('Test #10) Getting All Songs', async () => {
        const songs = await dbManager.getAllSongs();
        expect(songs.length).toBeGreaterThanOrEqual(testData.songs.length);
    });

    test('Test #11) Updating a Song', async () => {
        const updatedSong = await dbManager.updateSong(createdSongs[0]._id, {
            title: 'Updated Song Title'
        });
        
        expect(updatedSong.title).toBe('Updated Song Title');
    });

    test('Test #12) Deleting a Song', async () => {
        const songToDelete = await dbManager.createSong({
            title: 'Song to Delete',
            artist: 'Delete Artist',
            year: 2020,
            youtubeId: 'delete123',
            addedBy: createdUsers[0]._id
        });

        await dbManager.deleteSong(songToDelete._id);
        const deleted = await dbManager.findSongById(songToDelete._id);
        expect(deleted).toBeNull();
    });

    test('Test #13) Incrementing Song Listens', async () => {
        const song = createdSongs[0];
        const originalListens = song.numListens || 0;
        
        await dbManager.incrementSongListens(song._id);
        const updated = await dbManager.findSongById(song._id);
        
        expect(updated.numListens).toBe(originalListens + 1);
    });

    test('Test #14) Updating Song Playlist Count', async () => {
        const song = createdSongs[0];
        await dbManager.updateSongPlaylistCount(song._id);
        
        const updated = await dbManager.findSongById(song._id);
        expect(updated.numPlaylists).toBeGreaterThanOrEqual(0);
    });

    test('Test #15) Finding Songs by User', async () => {
        const songs = await dbManager.findSongsByAddedBy(createdUsers[0]._id);
        expect(songs.length).toBeGreaterThan(0);
    });

    test('Test #16) Searching Songs by Title', async () => {
        const results = await dbManager.searchSongs({
            title: testData.songs[0].title
        });
        
        expect(results.length).toBeGreaterThan(0);
    });
});

//playlist
describe('Playlist Operations', () => {
    test('Test #17) Creating a Playlist', async () => {
        const newPlaylist = {
            name: 'Brand New Playlist',
            owner: createdUsers[0]._id,
            ownerEmail: createdUsers[0].email,
            songs: [createdSongs[0]._id],
            playedBy: []
        };

        const playlist = await dbManager.createPlaylist(newPlaylist);
        expect(playlist).toBeDefined();
        expect(playlist.name).toBe(newPlaylist.name);
    });

    test('Test #18) Finding a Playlist by ID', async () => {
        const playlists = await dbManager.findPlaylistsByOwnerEmail(testData.users[0].email);
        const playlist = await dbManager.findPlaylistById(playlists[0]._id);
        
        expect(playlist).not.toBeNull();
        expect(playlist.name).toBe(playlists[0].name);
    });

    test('Test #19) Finding Playlists by Owner ID', async () => {
        const playlists = await dbManager.findPlaylistsByOwner(createdUsers[0]._id);
        expect(playlists.length).toBeGreaterThan(0);
    });

    test('Test #20) Finding Playlists by Owner Email', async () => {
        const playlists = await dbManager.findPlaylistsByOwnerEmail(testData.users[0].email);
        const expectedCount = testData.playlists.filter(
            p => p.ownerEmail === testData.users[0].email
        ).length;
        
        expect(playlists.length).toBe(expectedCount);
    });

    test('Test #21) Getting All Playlists', async () => {
        const playlists = await dbManager.getAllPlaylists();
        expect(playlists.length).toBe(testData.playlists.length);
    });

    test('Test #22) Updating a Playlist Name', async () => {
        const playlists = await dbManager.findPlaylistsByOwnerEmail(testData.users[0].email);
        const updatedPlaylist = await dbManager.updatePlaylist(playlists[0]._id, {
            name: 'Updated Playlist Name'
        });
        
        expect(updatedPlaylist.name).toBe('Updated Playlist Name');
    });

    test('Test #23) Updating Playlist Songs', async () => {
        const playlists = await dbManager.findPlaylistsByOwnerEmail(testData.users[0].email);
        const newSongIds = [createdSongs[0]._id, createdSongs[1]._id];
        
        const updatedPlaylist = await dbManager.updatePlaylist(playlists[0]._id, {
            songs: newSongIds
        });
        
        expect(updatedPlaylist.songs.length).toBe(2);
    });

    test('Test #24) Deleting a Playlist', async () => {
        const playlist = await dbManager.createPlaylist({
            name: 'Playlist to Delete',
            owner: createdUsers[0]._id,
            ownerEmail: createdUsers[0].email,
            songs: [],
            playedBy: []
        });

        await dbManager.deletePlaylist(playlist._id);
        const deleted = await dbManager.findPlaylistById(playlist._id);
        expect(deleted).toBeNull();
    });

    test('Test #25) Adding a Listener to Playlist', async () => {
        const playlists = await dbManager.findPlaylistsByOwnerEmail(testData.users[0].email);
        await dbManager.addListener(playlists[0]._id, createdUsers[1]._id);
        
        const updated = await dbManager.findPlaylistById(playlists[0]._id);
        expect(updated.playedBy.length).toBeGreaterThan(0);
    });

    test('Test #26) Searching Playlists by Name', async () => {
        const results = await dbManager.searchPlaylists({
            playlistName: testData.playlists[0].name
        });
        
        expect(results.length).toBeGreaterThan(0);
    });

    test('Test #27) Searching Playlists by Owner Username', async () => {
        const results = await dbManager.searchPlaylists({
            ownerUsername: testData.users[0].username
        });
        
        expect(results.length).toBeGreaterThan(0);
    });

    test('Test #28) Searching Playlists by Song Title', async () => {
        const results = await dbManager.searchPlaylists({
            songTitle: testData.songs[0].title
        });
        
        expect(results.length).toBeGreaterThan(0);
    });
});

// utility test
describe('Utility Operations', () => {
    test('Test #29) Clearing All Users', async () => {
        await dbManager.clearAllUsers();
        const user = await dbManager.findUserByEmail(testData.users[0].email);
        expect(user).toBeNull();
        await seedDatabase(); 
    });

    test('Test #30) Clearing All Songs', async () => {
        await dbManager.clearAllSongs();
        const songs = await dbManager.getAllSongs();
        expect(songs.length).toBe(0);
        await seedDatabase(); 
    });

    test('Test #31) Clearing All Playlists', async () => {
        await dbManager.clearAllPlaylists();
        const playlists = await dbManager.getAllPlaylists();
        expect(playlists.length).toBe(0);
        await seedDatabase(); 
    });
});
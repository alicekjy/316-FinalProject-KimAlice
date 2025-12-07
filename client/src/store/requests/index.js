const BASE_URL = "http://localhost:4000/api";

async function fetchWithCredentials(url, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    const response = await fetch(url, { ...defaultOptions, ...options});
    const data = await response.json();

    return {
        data: data,
        status: response.status,
        ok: response.ok
    };
}
//playlist requests
export const createPlaylist = () => {
    return fetchWithCredentials(`${BASE_URL}/playlist`,{
        method: 'POST',
        body: JSON.stringify({})
    });
};

export const deletePlaylistById = (id) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}`,{
        method: 'DELETE'
    });
};

export const getPlaylistById = (id) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}`, {
        method: 'GET'
    });
};

export const getPlaylists = () => {
    return fetchWithCredentials(`${BASE_URL}/playlists`, {
        method: 'GET'
    });
};

export const updatePlaylistById = (id, name, songs) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}`, {
        method: 'PUT',
        body: JSON.stringify({name, songs})
    });
};

export const copyPlaylist = (id) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}/copy`, {
        method: 'POST'
    });
};

export const playPlaylist = (id) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}/play`, {
        method: 'POST'
    });
};

export const addSongToPlaylist = (playlistId, songId) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/add-song`, {
        method: 'POST',
        body: JSON.stringify({playlistId, songId})
    });
};
//song requests
export const createSong = (title, artist, year, youtubeId) => {
    return fetchWithCredentials(`${BASE_URL}/song`,{
        method: 'POST',
        body: JSON.stringify({title, artist, year, youtubeId})
    });
};

export const getSongs = () => {
    return fetchWithCredentials(`${BASE_URL}/songs`, {
        method: 'GET'
    });
};

export const getSongById = (id) => {
    return fetchWithCredentials(`${BASE_URL}/song/${id}`,{
        method: 'GET'
    });
};

export const updateSong = (id, title, artist, year, youtubeId) => {
    return fetchWithCredentials(`${BASE_URL}/song/${id}`, {
        method: 'PUT',
        body: JSON.stringify({title, artist, year, youtubeId})
    });
};

export const deleteSong = (id) =>{
    return fetchWithCredentials(`${BASE_URL}/song/${id}`,{
        method: 'DELETE'
    });
};

export const searchSongs = (filters, sortBy, sortOrder) => {
    const params = new URLSearchParams();
    if(filters.title) params.append ('title', filters.title);
    if(filters.artist) params.append('artist', filters.artist);
    if(filters.year) params.append('year', filters.year);
    if(sortBy) params.append('sortBy', sortBy);
    if(sortOrder) params.append('sortOrder', sortOrder);

    return fetchWithCredentials(`${BASE_URL}/songs/search?${params.toString()}`,{
        method: 'GET'
    });
};

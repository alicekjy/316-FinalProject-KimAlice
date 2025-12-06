/*
    This is our http api, which we use to send requests to
    our back-end API. Note we`re using the Axios library
    for doing this, which is an easy to use AJAX-based
    library. We could (and maybe should) use Fetch, which
    is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

const BASE_URL = 'http://localhost:4000/store';
//Helper function to handle fetch requests with credential
async function fetchWithCredentials(url, options = {}){
    const defaultOptions = {
        //include cookies - JWT token 
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    const response = await fetch(url, { ...defaultOptions, ...options});
    // Parse JSON response
    const data = await response.json();
    // Return response in a format similar to axios
    return{
        data: data,
        status: response.status,
        ok: response.ok
    };
}
// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

// export const createPlaylist = (newListName, newSongs, userEmail) => {
//     return api.post(`/playlist/`, {
//         // SPECIFY THE PAYLOAD
//         name: newListName,
//         songs: newSongs,
//         ownerEmail: userEmail
//     })
// }
export const createPlaylist = (newListName, newSongs, userEmail) =>{
    return fetchWithCredentials(`${BASE_URL}/playlist/`, {
        method: 'POST',
        body: JSON.stringify({
            name: newListName,
            songs: newSongs,
            ownerEmail: userEmail
        })
    });
};
// export const deletePlaylistById = (id) => api.delete(`/playlist/${id}`)
export const deletePlaylistById = (id) =>{
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}`,{
        method: 'DELETE'
    });
};

// export const getPlaylistById = (id) => api.get(`/playlist/${id}`)
export const getPlaylistById = (id) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}`,{
        method: 'GET'
    });
};

// export const getPlaylistPairs = () => api.get(`/playlistpairs/`)
export const getPlaylistPairs = () => {
    return fetchWithCredentials(`${BASE_URL}/playlistpairs/`, {
        method: 'GET'
    });
};

// export const updatePlaylistById = (id, playlist) => {
//     return api.put(`/playlist/${id}`, {
//         // SPECIFY THE PAYLOAD
//         playlist : playlist
//     })
// }
export const updatePlaylistById = (id, playlist) => {
    return fetchWithCredentials(`${BASE_URL}/playlist/${id}`,{
        method: 'PUT',
        body: JSON.stringify({
            playlist: playlist
        })
    })
}
const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
}

export default apis

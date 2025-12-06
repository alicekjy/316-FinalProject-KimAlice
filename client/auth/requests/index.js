/**
 * Auth API requests for Playlister Final Project
 */
const BASE_URL = 'http://localhost:4000/auth'; 

//helper function to handle fetch requests with credentials 
async function fetchWithCredentials(url, options = {}){
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    try {
        const response = await fetch(url, {...defaultOptions, ...options});
        const hasBody = response.status !== 204 && response.headers.get('content-length') !== '0';
        let data = null;

        if (hasBody) {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                try {
                    data = await response.json();
                } catch (parseError) {
                    data = null;
                }
            } else {
                data = await response.text();
            }
        }

        if (!response.ok) {
            const error = new Error(data?.errorMessage || response.statusText || 'Request failed');
            error.response = {
                status: response.status,
                data: data
            };
            throw error;
        }
        return {
            data: data,
            status: response.status,
            ok: response.ok
        };
    } catch (error) {
        if (!error.response) {
            error.response = {
                status: 0,
                data: {
                    errorMessage: 'Network error. Please check that the server is running.'
                }
            };
        }
        throw error;
    }
}

// export const getLoggedIn = () => api.get(`/loggedIn/`);
export const getLoggedIn = () => {
    return fetchWithCredentials(`${BASE_URL}/loggedIn/`,{
        method: 'GET'
    });
};

export const loginUser = (email, password) => {
    return fetchWithCredentials(`${BASE_URL}/login/`,{
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
}
// export const logoutUser = () => api.get(`/logout/`)
export const logoutUser = () =>{
    return fetchWithCredentials(`${BASE_URL}/logout/`,{
        method: 'GET'
    });
};
// Register user - now with username and avatar instead of first/last name
export const registerUser = (username, email, password, passwordVerify, avatar) => {
    return fetchWithCredentials(`${BASE_URL}/register/`,{
        method: 'POST',
        body : JSON.stringify({
            username: username, 
            email: email,
            password: password,
            passwordVerify: passwordVerify,
            //avatar to default empty string if there is no avatar
            avatar: avatar | '' 
        })
    });
};

const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}

export default apis

/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we`re 
    using the Axios library for doing this, which is an easy to 
    use AJAX-based library. We could (and maybe should) use Fetch, 
    which is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/
const BASE_URL = 'http://localhost:4000/auth'; 

//helper function to handle fetch requests with credentials 
async function fetchWithCredentials(url, options = {}){
    const defaultOptions = {
        //axios.defaults.withCredentials = true
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
// THESE ARE ALL THE REQUESTS WE'LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

// export const getLoggedIn = () => api.get(`/loggedIn/`);
export const getLoggedIn = () => {
    return fetchWithCredentials(`${BASE_URL}/loggedIn/`,{
        method: 'GET'
    });
};

// export const loginUser = (email, password) => {
//     return api.post(`/login/`, {
//         email : email,
//         password : password
//     })
// }
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
// export const registerUser = (firstName, lastName, email, password, passwordVerify) => {
//     return api.post(`/register/`, {
//         firstName : firstName,
//         lastName : lastName,
//         email : email,
//         password : password,
//         passwordVerify : passwordVerify
//     })
// }
export const registerUser = (firstName, lastName, email, password, passwordVerify) => {
    return fetchWithCredentials(`${BASE_URL}/register/`,{
        method: 'POST',
        body : JSON.stringify({
            firstName : firstName,
            lastName: lastName, 
            email: email,
            password: password,
            passwordVerify: passwordVerify
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

const BASE_URL = 'http://localhost:4000/auth'; 

async function fetchWithCredentials (url, options = {}){
    const defaultOptions = {
        credentials: 'include',
        headers:{
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    try{
        const response = await fetch(url, {...defaultOptions, ...options});
        const hasBody = response.status !== 204 && response.headers.get('content-length') !=='0';
        let data = null;

        if(hasBody){
            const contentType = response.headers.get('content-type') || '';
            if(contentType.includes('application/json')){
                try{
                    data = await response.json();
                }catch(parseError){
                    data = null;
                }
            }else{
                data = await response.text();
            }
        }

        if(!response.ok){
            const error = new Error(data?.errorMessage || response.statusText|| 'Request failed');
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
    }catch(error){
        if(!error.response){
            error.response = {
                status: 0,
                data:{
                    errorMessage: 'Network error. Please check that the server is running.'
                }
            };
        }
        throw error;
    }
}
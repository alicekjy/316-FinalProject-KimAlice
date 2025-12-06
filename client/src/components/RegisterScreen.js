import {useContext, useState} from 'react';
import AuthContext from '../auth';
import {Link} from 'react-router-dom';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default function RegisterScreen(){
    const{auth} = useContext(AuthContext);
    const [ username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState('');
    const [avatar, setAvatar] = useState('');

    const handleAvatarChange = (event) =>{
        const file = event.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onloadend = () =>{
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if(password !== passwordVerify){
            alert("Passwords don't match");
            return;
        }
        auth.registerUser(username, email, password, passwordVerify, avatar);
    }
    return (
        <Box sx = {{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: 3
        }}>
            <Box sx = {{
                bgcolor: 'white',
                borderRadius: 2,
                padding: 4,
                minWidth: '400px',
                boxShadow: 3
            }}>
                <Typography variant = "h4" sx = {{mb: 3, textAlign: 'center'}}>
                    Create Account
                </Typography>
                
                {auth.errorMessage && (
                    <Alert severity = "error" sx = {{mb:2}}>
                        {auth.errorMessage}
                    </Alert>
                )}
                <form onSubmit = {handleSubmit}>
                    <TextField
                        fullWidth
                        label = "Username"
                        value = {username}
                        onChange = {(e)=> setUsername(e.target.value)}
                        margin = "normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label = "Email"
                        type = "email"
                        value = {email}
                        onChange = {(e) => setEmail(e.target.value)}
                        margin = "normal"
                        required
                        />
                    <TextField 
                        fullWidth
                        label = "Password"
                        type = "password"
                        value = {password}
                        onChange = {(e)=> setPassword(e.target.value)}
                        margin = "noraml"
                        required
                    />
                    <TextField
                        fullWidth
                        label = "Verify Password"
                        type = "password"
                        value = {passwordVerify}
                        onChange = {(e)=> setPasswordVerify(e.target.value)}
                        margin = "normal"
                        required
                    />
                    <Box sx = {{mt: 2, mb: 2}}>
                        <Typography variant = "body2" sx = {{mb:1}}>
                            Avatar (optional):
                        </Typography>
                        <Button
                            variant = "outlined"
                            component = "label"
                            fullWidth
                            >
                                Upload Avatar Image
                                <input
                                    type = "file"
                                    hidden
                                    accept = "image/*"
                                    onChange = {handleAvatarChange}
                                    />
                            </Button>
                            {avatar && (
                                <Box sx = {{mt:2, testAlign: 'center'}}>
                                    <img
                                        src = {avatar}
                                        alt = "Avatar preview"
                                        style = {{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Box>
                            )}
                    </Box>

                    <Button
                        type = "submit"
                        fullWidth
                        variant = "contained"
                        sx = {{mt: 2, mb:2}}
                        >
                            Create Account
                        </Button>
                    <Typography variant = "body2" sx = {{textAlign: 'center'}}>
                        Already have an account? {' '}
                        <Link to = "/login" style = {{color: '#1976d2'}}>
                            Login here
                        </Link>
                    </Typography>
                    <Typography variant = "body2" sx = {{textAlign: 'center', mt:1}}>
                        <Link to = "/" style = {{color: '#666'}}>
                            Back to Welcome
                        </Link>
                    </Typography>
                </form>
            </Box>
        </Box>
    )
}
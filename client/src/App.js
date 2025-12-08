import './App.css';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store';
import {
    SplashScreen,
    LoginScreen,
    RegisterScreen,
    AppBanner,
    HomeScreen,
    PlaylistScreen,
    SongScreen,
    EditAccountScreen
} from './components';

function App() {
    return (
        <BrowserRouter>
            <AuthContextProvider>
                <GlobalStoreContextProvider>
                    <AppBanner />
                    <Switch>
                        <Route path="/" exact component={SplashScreen} />
                        <Route path="/login" exact component={LoginScreen} />
                        <Route path="/register" exact component={RegisterScreen} />
                        <Route path="/edit-account" exact component={EditAccountScreen} />
                        <Route path="/playlists" exact component={HomeScreen} />
                        <Route path="/home" exact render={() => <Redirect to="/playlists" />} />
                        <Route path="/playlist/:id" exact component={PlaylistScreen} />
                        <Route path="/songs" exact component={SongScreen} />
                </Switch>
                </GlobalStoreContextProvider>
            </AuthContextProvider>
        </BrowserRouter>
    );
}

export default App;

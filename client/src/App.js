import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store';
import {
    SplashScreen,
    LoginScreen,
    RegisterScreen,
    AppBanner,
    HomeScreen,
    PlaylistScreen,
    SongScreen
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
                    <Route path = "/home" exact component = {HomeScreen} />
                    <Route path = "/playlist/:id" exact component = {PlaylistScreen} />
                    <Route path = "/songs" exact component = {SongScreen} />
                </Switch>
                </GlobalStoreContextProvider>
            </AuthContextProvider>
        </BrowserRouter>
    );
}

export default App;
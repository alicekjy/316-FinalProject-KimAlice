import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AuthContextProvider } from './auth';
import {
    SplashScreen,
    LoginScreen,
    RegisterScreen
} from './components';

function App() {
    return (
        <BrowserRouter>
            <AuthContextProvider>
                <Switch>
                    <Route path="/" exact component={SplashScreen} />
                    <Route path="/login" exact component={LoginScreen} />
                    <Route path="/register" exact component={RegisterScreen} />
                </Switch>
            </AuthContextProvider>
        </BrowserRouter>
    );
}

export default App;
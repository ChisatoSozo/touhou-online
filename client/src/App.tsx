import React from 'react';
import {
    BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import { Game } from './pages/Game';
import { Menu } from './pages/Menu';

function App() {
    return <Router>
        <Switch>
            <Route path="/game/">
                <Game />
            </Route>
            <Route path="/">
                <Menu />
            </Route>
        </Switch>
    </Router>
}

export default App;

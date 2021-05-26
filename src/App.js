import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from 'react-router-dom';
import StartLine from 'components/startLine/StartLine';
import PilotList from 'components/pilots/PilotList';
import AircraftList from 'components/aircraft/AircraftList';
import 'styles/reset.scss';
import 'styles/general.scss';

export default () => (
  <div>
    <Router>
      <Switch>
        <Route path="/" exact>
          <StartLine />
        </Route>
        <Route path="/aircraft">
          <AircraftList />
        </Route>
        <Route path="/pilots">
          <PilotList />
        </Route>
      </Switch>

      <nav className="tabs">
        <ul>
          <li>
            <NavLink to="/pilots">Pilots</NavLink>
          </li>
          <li>
            <NavLink to="/aircraft">Aircraft</NavLink>
          </li>
          <li>
            <NavLink to="/" exact>Starting</NavLink>
          </li>
        </ul>
      </nav>
    </Router>
  </div>
);

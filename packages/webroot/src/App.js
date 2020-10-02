import React from 'react';
import Container from '@material-ui/core/Container';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import { routes } from './routes';
import AppStateProvider from './AppStateProvider';

export default function App() {
  return (
    <AppStateProvider>
    <Container>
      {/* <Header /> */}
      <Router>
        <Switch>
          {Object.keys(routes).map((key, i) => (
            // Create route component for all routes in /routes.js
            <Route
              key={i}
              path={routes[key].path}
              component={routes[key].component}
            />
          ))}
        </Switch>
      </Router>
      {/* <Copyright /> */}
    </Container>
    </AppStateProvider>
  );
}

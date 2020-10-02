import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Logo from '../Logo'
import ErrorBoundary from '../ErrorBoundary'

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
    background: '#000000'
  },
}));

export default function Header() {
  const classes = useStyles();
  
  return (
    <div>
      <AppBar position="absolute" className={classes.appBar}>
        <ErrorBoundary>
          <Toolbar>
            <Logo
              type="image"
              logoType="vertical"
            />
            <Typography variant="h5" color="inherit" noWrap>
              Project Soteria
            </Typography>
          </Toolbar>
        </ErrorBoundary>
      </AppBar>
    </div>
  );
}

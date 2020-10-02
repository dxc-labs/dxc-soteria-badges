import React from 'react';
import {
    Paper,
    Container,
    makeStyles,
    Typography,Link
} from '@material-ui/core';
import Header from './../Header';

const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(3),
        padding: theme.spacing(2),
    },
    button: {
        margin: theme.spacing(1),
        padding: theme.spacing(1),
    },
}));

function Copyright() {
    return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'Project Soteria. Copyright © '}
        <Link color="inherit" href="https://dxc.technology/opensource">
          Project Soteria
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
  }

export default function ErrorMessage(props) {
    const classes = useStyles();
    return (
    <div>
    <Header />
    <Container maxWidth="md">
        <Paper className={classes.paper}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h1" color="inherit">
               {props.status}
           </Typography>
           </div>
           <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h2" color="inherit">
               {props.message}
           </Typography>
           </div>
        </Paper>
    </Container>
    <Copyright />
    </div>
    );
}
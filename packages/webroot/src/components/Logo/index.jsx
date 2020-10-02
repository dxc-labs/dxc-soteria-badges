import React, { useState, useEffect } from 'react';
import {
    CardMedia,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  logo: {
    maxWidth: 75,
  },
}));

export default function Logo({type, logoType}) {
  const classes = useStyles();
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    try {
        setLogo(require(`./../../assets/img/${process.env.REACT_APP_TENANT}_${logoType}_logo.png`));
    }
    catch(error) {
        setLogo(require(`./../../assets/img/default_${logoType}_logo.png`));
    }
  },[logo, logoType])
  
  return (
      <div>
        {(() => {
          if(type === "card") {
            return (
              <CardMedia
                component="img"
                style={{ height: 67, width: 287 }}
                image={logo}
                title="Project Soteria"
              />
            );
          }
          else if(type === "image") {
            return (
              <img src={logo} alt="logo" className={classes.logo} />
            );
          }
        })()}

      </div>
  );
} 

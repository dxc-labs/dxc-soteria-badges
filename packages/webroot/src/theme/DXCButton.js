import { createMuiTheme } from '@material-ui/core/styles';

const DXCButton = createMuiTheme({
        palette: {
            primary: {
                light: "#00000",
                main: "#000000",
                dark: "#00000",
                contrastText: "#0000"
            },
            secondary: {
                light: '#d9d9d9',
                main: '#000000',
                contrastText: '#ffed00',
            }
        }
    });

export default DXCButton;
import React, { Component } from 'react';
import {
    Typography, Container,
    Card, CardActionArea, CardContent,
} from '@material-ui/core';
import appleButton from '../../assets/img/Add_to_Apple_Wallet_rgb_US-UK.png'
import axios from 'axios';
import ErrorMessage from '../ErrorMessage'
import QRCode from 'qrcode.react';
import Logo from '../Logo'
import ErrorBoundary from '../ErrorBoundary' 
import * as HttpStatus from 'http-status-codes'

var is_IOS = /(iPhone|iPod|iPad|Macintosh).*AppleWebKit/i.test(navigator.userAgent);

class Badges extends Component {

    constructor(props) {
        super(props);
        this.state = {
            badgeDetails: [],
            dataFetched: false,
            color: '',
            statusCode: null,
            invalidAPI: false,
        };
        this.generateQRCode = this.generateQRCode.bind(this);
    }

    generateQRCode() {
        const QRCodeBaseURL = "https://"+ process.env.REACT_APP_USER_DOMAIN +"/l";
        const qrCodeID = QRCodeBaseURL + '/' + this.props.match.params.raaid;
        return qrCodeID;
     }

    async componentDidMount() {
        const baseURL =`https://${process.env.REACT_APP_API_USER_DOMAIN}/badges`;
        var optionAxios = { 
            headers: {
                "Accept": "application/json",
                "Authorization": this.props.location.hash.slice(1)
            }
        }
        try {
            let response = await axios.get(baseURL + '/requests/' + this.props.match.params.raaid, optionAxios)
            const color = response.data.passType === 'employee' ? '#000' : '#6F2C91';
            this.setState({ badgeDetails: response.data, dataFetched: true, color: color, statusCode: response.status});
            console.log(response.status);
        } catch (error) {
            this.setState({ dataFetched: false});
            if (error.response === null){
                this.setState({statusCode: HttpStatus.INTERNAL_SERVER_ERROR});
            } else {
                this.setState({statusCode: error.response.status});
            }
        }
    }
    
    render() {
        if(!this.state.dataFetched && this.state.statusCode === HttpStatus.FORBIDDEN){
            let errMsg = `Error ${this.state.statusCode} : Access denied!`
            return (<ErrorMessage message={errMsg}/>)
        } else if (!this.state.dataFetched && this.state.statusCode === HttpStatus.NOT_FOUND){
            let errMsg = `Error ${this.state.statusCode} : User not enrolled!`
            return (<ErrorMessage message={errMsg}/>)
        } else if(!this.state.dataFetched && this.state.statusCode === HttpStatus.INTERNAL_SERVER_ERROR){
            let errMsg = `Error ${this.state.statusCode} : Oops, Something Went Wrong`
            return (<ErrorMessage message={errMsg}/>)
        } else if(!this.state.dataFetched && this.state.statusCode != null){
            let errMsg = `Error ${this.state.statusCode} : Something went wrong!`
            return (<ErrorMessage message={errMsg}/>)
        } else if (!this.state.dataFetched) return null;
        
        return (
            <Container maxWidth="xs">
                <Card style={{ backgroundColor: this.state.color, color: '#FFF', padding: 10 }}>
                    <ErrorBoundary>
                        <CardActionArea>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Logo
                                    type="card"
                                    logoType="horizontal" 
                                />
                            </div>
                            <CardContent>
                                {(() => {
                                    if (this.state.badgeDetails.passType === 'employee') {
                                        return (
                                            <div>
                                                <br />
                                                <br />
                                                <br />
                                            </div>
                                        );
                                    }
                                })()}
                                {(() => {
                                    if (this.state.badgeDetails.passType === 'visitor') {
                                        return (
                                            <div>
                                                <Typography variant="h6" component="h6" style={{ color: 'yellow' }}>Location</Typography>
                                                <Typography variant="body2" component="p">{this.state.badgeDetails.passLocation}</Typography>
                                                <Typography variant="h6" component="h6" style={{ color: 'yellow', paddingTop: 10 }}>Valid Date</Typography>
                                                <Typography variant="body2" component="p" style={{ paddingBottom: 10 }}>{ new Date(this.state.badgeDetails.validDate).toLocaleString('en-us',{month:'short', year:'numeric', day:'numeric'})}</Typography>
                                                <Typography variant="h6" component="h6" style={{ color: 'yellow' }}>Valid Time</Typography>
                                                <Typography variant="body2" component="p" style={{ paddingBottom: 10 }}>00:00 - 23:59</Typography>
                                            </div>
                                        );
                                    }
                                })()}
                                <Typography gutterBottom variant="h5" component="h5">
                                    {this.state.badgeDetails.name}
                                </Typography>
                                {(() => {
                                    if (this.state.badgeDetails.passType === 'employee') {
                                        return (
                                            <div>
                                                <Typography variant="body1" component="p" style={{ textTransform: 'capitalize' }}>
                                                    Full Time
                                                </Typography>
                                            </div>
                                        );
                                    }
                                })()}
                                {(() => {
                                    if (this.state.badgeDetails.passType === 'visitor') {
                                        return (
                                            <div>
                                                <Typography variant="h6" component="h6">{this.state.badgeDetails.visitorOrgName}</Typography>
                                                <Typography variant="body1" component="p" style={{ textTransform: 'capitalize' }}>
                                                    {this.state.badgeDetails.passType}
                                                </Typography>
                                            </div>
                                        );
                                    }
                                })()}
                                {(() => {
                                    if (this.state.badgeDetails.passType === 'employee') {
                                        return (
                                            <div>
                                                <br />
                                                <br />
                                                <br />
                                            </div>
                                        );
                                    }
                                })()}
                            </CardContent>
                            {/*<div style={{ display: 'flex', justifyContent: 'center' }}>
                                <CardMedia style={{ height: 150, width: 150 }}
                                    //image={require ("./../../assets/img/qrcode.png")}
                                    image={`data:image/png;base64,${this.state.raa.passUrl}`}
                                    title="Project Soteria"
                                />
                            </div>*/}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <div>
                                    <QRCode
                                        id={this.generateQRCode()}
                                        value={this.generateQRCode()}
                                        size={150}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                </div>
                            </div>
                            {(() => {
                                if (this.state.badgeDetails.passType === 'employee') {
                                    return (
                                        <div>
                                            <br />
                                            <br />
                                            <br />
                                        </div>
                                    );
                                } else if (this.state.badgeDetails.passType === 'visitor') {
                                    return (
                                        <div>
                                            <br />
                                        </div>
                                    );
                                }
                            })()}
                        </CardActionArea>
                    </ErrorBoundary>
                </Card>
                {(() => {
                    if (is_IOS === true) {
                        return (
                            <div>
                                <br />
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <a href={`data:application/vnd.apple.pkpass;base64,${this.state.badgeDetails.applepassUrl}`}>
                                        <img src={appleButton} alt="appleButton" /></a>
                                </div>
                            </div>
                        );
                    }
                }
                )()}
            </Container>
        );
    }
}
export default Badges;      

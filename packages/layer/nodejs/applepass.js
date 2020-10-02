const slugid = require('slugid');
const { Template } = require("@walletpass/pass-js");

const aws = require('./aws');
const path = require('path');
const config = require('./config');
aws.region = config.getDeployTime('region');

const applePassKitBucket = config.getDeployTime('applePassKitBucket');
const userDomainName = config.getDeployTime('userDomainName');
const appleCertificateName = config.getDeployTime('appleCertificate');
const appleCertificateKeyName = config.getDeployTime('appleCertificateKey');
const applePassTypeIdentifierName = config.getDeployTime('applePassTypeIdentifier');
const appleTeamIdentifierName = config.getDeployTime('appleTeamIdentifier');
const applePassValidityInDaysParam = config.getDeployTime('applePassValidityInDays');
const tenant4Logo = config.getDeployTime('useTenant4Logo');

exports.createpass = async function createpass(passType, passLocation, name, requestId) {

    console.log("Apple-Pass-Creation")

    const serialNo = requestId;

    let passDetails = await setPassDetails(passType, applePassKitBucket, passLocation)

    console.log("expiryDate for the apple-pass: ", passDetails._expiryDate)

    const template = await Template.load(
        path.resolve(__dirname + passDetails._template),
        "secretKeyPasswod"
    );
    console.log("Apple Pass template:", template);
    const applePassTypeIdentifier = await config.getRunTime(applePassTypeIdentifierName)
    const appleTeamIdentifier = await config.getRunTime(appleTeamIdentifierName)

    template.passTypeIdentifier = applePassTypeIdentifier;
    template.teamIdentifier = appleTeamIdentifier;
    template.organizationName = "Project Soteria"

    const s3Certificate = await config.getRunTime(appleCertificateName, true)
    const appleCertificateKey = await config.getRunTime(appleCertificateKeyName)
    await template.setCertificate(s3Certificate, appleCertificateKey)

    const pass = template.createPass({
        serialNumber: serialNo,
        expirationDate: passDetails._expiryDate,
        barcodes: [{
            message: "https://" + userDomainName + "/l/" + serialNo,
            format: "PKBarcodeFormatQR",
            messageEncoding: "iso-8859-1"
        }]
    });
    pass.primaryFields.add({
        key: "name",
        label: "",
        value: name
    }),
        pass.secondaryFields.add({
            key: "type",
            label: "TYPE",
            value: passDetails._type
        });
    pass.secondaryFields.add({
        key: passDetails._secondaryFieldKey,
        label: passDetails._secondaryFieldLable,
        value: passDetails._secondaryFieldValue
    });
    if (passType === "employee") {
        pass.backFields.add({
            key: "expiryDate",
            label: "EXPIRY DATE",
            value: pass.expirationDate.toLocaleString('en-us', { month: 'short', year: 'numeric', day: 'numeric' })
        })
    } else if (passType === "visitor") {
        pass.headerFields.add({
            key: "validDateHeader",
            label: "VALID DATE",
            value: pass.expirationDate.toLocaleString('en-us', { month: 'short', year: 'numeric', day: 'numeric' })
        })
        pass.backFields.add({
            key: "validDate",
            label: "VALID DATE",
            value: pass.expirationDate.toLocaleString('en-us', { month: 'short', year: 'numeric', day: 'numeric' })
        })
        pass.backFields.add({
            key: "validTime",
            label: "VALID TIME",
            value: "00:00 - 23:59"
        })
    }
    console.log("Apple Pass: ", JSON.stringify(pass))
    const buf = await pass.asBuffer();
    const passdata = {
        fileContents: buf,
        fileName: 'sample.pkpass',
        mimeType: 'application/vnd.apple.pkpass'
    }
    const fileExtension = '.' + (passdata.fileName).split('.')[1];

    const params = {
        Bucket: passDetails._s3ApplePassLocation,
        ContentType: passdata.mimeType,
        Key: (slugid.nice() + fileExtension).trim(),
        Body: passdata.fileContents
    }

    let result = await aws.addFile(params);
    if (result.Location) {
        console.log("Apple Pass Location URL:", result.Location);
        return result.Location;
    }
    return null;
}

async function setPassDetails(passType, bucketName, passLocation) {

    const applePassValidityInDays = await config.getRunTime(applePassValidityInDaysParam)
    const expiryPass = new Date();
    let passDetails = {};

    if (passType === "employee") {
        passDetails = {
            _expiryDate: new Date(expiryPass.setDate(expiryPass.getDate() + parseInt(applePassValidityInDays))),
            _template: `/applePassTemplates/${tenant4Logo}-EmployeeApplePassTemplate.pass`,
            _type: "Full Time",
            _secondaryFieldKey: "empID",
            _secondaryFieldLable: "",
            _secondaryFieldValue: "",
            _s3ApplePassLocation: bucketName + "/ApplePass/Employee"
        }
    } else if (passType === "visitor") {
        passDetails = {
            _expiryDate: new Date(expiryPass.setHours(23, 59, 59, 999)),
            _template: `/applePassTemplates/${tenant4Logo}-VisitorApplePassTemplate.pass`,
            _type: "Visitor",
            _secondaryFieldKey: "location",
            _secondaryFieldLable: "LOCATION",
            _secondaryFieldValue: passLocation,
            _s3ApplePassLocation: bucketName + "/ApplePass/Visitor"
        }
    }
    return passDetails;
}

console.log("LoadFormData JS started... ");

console.log("FORMS_ENGINE_API_BASEURL", process.env.REACT_APP_FORMS_ENGINE_API);

const REACT_APP_FORMS_ENGINE_API = process.env.REACT_APP_FORMS_ENGINE_API;

console.log("FORM_API_URL is ", REACT_APP_FORMS_ENGINE_API);

const VisRegSingapore = require("./../src/components/VisitorRegistration/data/data-singapore.json");
const VisRegDefault = require("./../src/components/VisitorRegistration/data/data-default.json");

var filesArray = [VisRegSingapore, VisRegDefault];
console.log(filesArray.length);

for(i=0; i <= filesArray.length; i++){
    const axios = require('axios')
    var optionAxios = {
        headers: {
            tenant: 'forms'
        }
    }
    axios.post(REACT_APP_FORMS_ENGINE_API + '/forms',
    filesArray[i], optionAxios)
    .then((res) => {
        console.log(`statusCode: ${res.status}`)
        console.log(res)
    })
    .catch((error) => {
        console.error(error)
    })

}
// Usage: node createOdata.js

const moment = require('moment');
const csvtojson = require('csvtojson');
const rp = require('request-promise');

const BASE_URL = 'https://org-event-service.demo-jp.personium.io/';

const toNum = (str) => {
  return str ? Number(str) : null;
};

const toDate = (str) => {
  return str ? `/Date(${moment(str).valueOf('')})/` : null;
};

const toArray = (str) => {
  return str ? str.split(',') : null;
};

const convert = (orig) => {
  const converted = Object.assign({}, orig);
  converted.recruitmentNumber = toNum(converted.recruitmentNumber);
  converted.price = toNum(converted.price);
  converted.latitude = toNum(converted.latitude);
  converted.longitude = toNum(converted.longitude);
  converted.startDate = toDate(converted.startDate);
  converted.endDate = toDate(converted.endDate);
  converted.postDate = toDate(converted.postDate);
  converted.keywords = toArray(converted.keywords);
  return converted;
};

const auth = async () => {
  const options = {
    method: 'POST',
    uri: `${BASE_URL}__token`,
    headers: {
      Accept: 'application/json',
    },
    form: {
      grant_type: 'password',
      username: 'me',
      password: 'change-password',
    },
    json: true,
  };
  return rp(options);
};

const createOData = async (token, body) => {
  const options = {
    method: 'POST',
    uri: `${BASE_URL}timefiller/OData/Events`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body,
    json: true,
  };
  return rp(options);
}

(async () => {
  try {
    const authRes = await auth();
    console.log(authRes);
    const jsonObj = await csvtojson().fromFile('input.csv');

    jsonObj.forEach(async (orig) => {
      const converted = convert(orig);
      console.log(converted);
      const body = await createOData(authRes.access_token, converted);
    }); 
  } catch (err) {
    if (err.statusCode && err.error) {
      console.error(err.statusCode);
      console.error(err.error);
    } else {
      console.error(err);
    }
  }
})();

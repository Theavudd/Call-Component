import axios from 'axios';
const BASE_URL = 'https://callapp-rcc.herokuapp.com/rtc/';

const getToken = (
  channelName: string,
  uid: string,
  successCallback: Function,
  failureCallback: Function,
) => {
  axios
    .get(`${BASE_URL}${channelName}/publisher/uid/${uid}/?expiry=`)
    .then((res: any) => successCallback(res))
    .catch((error: any) => failureCallback(error));
};

export default {getToken};

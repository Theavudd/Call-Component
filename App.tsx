import React, {useEffect, useState} from 'react';
import Call from './src/modules/call';
import {showSnackBar} from './src/utils/CommonFunctions';
import services from './src/utils/services';

const config = {
  appId: '8c7c96fa8c0546db919c842a796cff88',
  token:
    '007eJxTYNCVDS3RW37PyDhne0n75Bip0KUFK7mX8F+pCO4WO1te1qXAYJFsnmxplpZokWxgamKWkmRpaJlsYWKUaG5plpyWZmERuU4r+cZ/7eTjHXNZmBgYwRDEZ2MoTswtyEllYGBlAAEA7echrQ==',
  channelId: 'sample',
};

export default function App() {
  const [token, setToken] = useState('');
  useEffect(() => {
    services.getToken(
      'sample',
      '999',
      (res: any) => {
        setToken(res?.data?.rtcToken);
      },
      (error: any) => {
        showSnackBar(error.message);
      },
    );
  }, []);

  return (
    <Call
      config={{appId: config.appId, token: token, channelId: 'sample'}}
      videoIconContainer={undefined}
      videoCallIcon={undefined}
      videoCallIconStyle={undefined}
      profileImage={require('./src/assets/images/videoCamera.png')}
      profileName={'John Smith'}
    />
  );
}

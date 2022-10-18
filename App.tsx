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
  const [type,setType] = useState('video')
  const [iscallActive, setIscallActive] = useState(false)
  useEffect(() => {
    services.getToken(
      'sample',
      '0',
      (res: any) => {
        setToken(res?.data?.rtcToken);
      },
      (error: any) => {
        showSnackBar(error.message);
      },
    );
  }, []);

  const onVideoCallPress = () => {
    setType('video');
    setIscallActive(true)
  };

  const onAudioCallPress = () => {
    setType('audio');
    setIscallActive(true)
  };

  const onEndCall = () => {
    setIscallActive(false)
  };

  return (
    <Call
    isCallActive={iscallActive}
    onEndCall={onEndCall}
        onVideoCallPress={onVideoCallPress}
        onAudioCallPress={onAudioCallPress}
    type={type}
      config={{appId: config.appId, token: token, channelId: 'sample'}}
      videoIconContainerStyle={undefined}
      videoCallIcon={undefined}
      videoCallIconStyle={undefined}
      // profileImage={require('./src/assets/images/img.jpeg')}
      // profileImage={{uri: 'https://www.codedaily.io/me/me.jpg',}}
      profileName={'John Smith'}
    />
  );
}

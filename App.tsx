import React from 'react';
import Call from './src/modules/call';

const config = {
  appId: '8c7c96fa8c0546db919c842a796cff88',
  token:
    '007eJxTYNCVDS3RW37PyDhne0n75Bip0KUFK7mX8F+pCO4WO1te1qXAYJFsnmxplpZokWxgamKWkmRpaJlsYWKUaG5plpyWZmERuU4r+cZ/7eTjHXNZmBgYwRDEZ2MoTswtyEllYGBlAAEA7echrQ==',
  channelId: 'sample',
};

export default function App() {
  return (
    <Call
      config={config}
      videoIconContainer={undefined}
      videoCallIcon={undefined}
      videoCallIconStyle={undefined}
      profileImage={require('./src/assets/images/videoCamera.png')}
      profileName={'John Smith'}
    />
  );
}

import React from 'react';
import Call from './src/modules/call';

const config = {
  appId: '8c7c96fa8c0546db919c842a796cff88',
  token:
    '007eJxTYPBwNjvzIn1C2wTfd25qvBOXONq5z1irPPNT9VZGiXNBx24oMFgkmydbmqUlWiQbmJqYpSRZGlomW5gYJZpbmiWnpVlY7PqonmzlrJmccl2AiYmBEQxBfDaG4sTcgpxUBgZWBhAAADV9IHc=',
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

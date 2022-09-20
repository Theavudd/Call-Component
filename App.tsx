import React from 'react';
import Call from './src/modules/call';

const config = {
  appId: '8c7c96fa8c0546db919c842a796cff88',
  token:
    '007eJxTYJjycsf0ad3quvXPH5+cn5OTFcOQ/5pB9Y3zqv//1f08ul8rMFgkmydbmqUlWiQbmJqYpSRZGlomW5gYJZpbmiWnpVlYCAZpJk9crJXccHgNExMDIxiC+GwMxYm5BTmpDAysDCAAAPv0IzM=',
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

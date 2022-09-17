import React from 'react';
import Call from './src/modules/call';

const config = {
  appId: '8c7c96fa8c0546db919c842a796cff88',
  token:
    '007eJxTYOjdkuaq8an7gnPfyi0nHYUk5j3xrI/nMInQ2SjybyWvc70Cg0WyebKlWVqiRbKBqYlZSpKloWWyhYlRormlWXJamoVFdqxK8ut1qslmAouYmBgYwRDEZ2MoTswtyEllYGBlAAEAFiQgmg==',
  channelId: 'sample',
};

export default function App() {
  return (
    <Call
      config={config}
      videoIconContainer={undefined}
      videoCallIcon={undefined}
      videoCallIconStyle={undefined}
      image={require('./src/assets/images/videoCamera.png')}
    />
  );
}

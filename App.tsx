import React from 'react';
import Call from './src/modules/call';

const config = {
  appId: '8c7c96fa8c0546db919c842a796cff88',
  token:
    '007eJxTYGAN+XKVYcPH3FVtomesX3Mkf8or3zf7bNW93Y80LimuzeRRYLBINk+2NEtLtEg2MDUxS0myNLRMtjAxSjS3NEtOS7OwaDmslMwkqpLc0nGEiYmBEQxBfDaG4sTcgpxUBgZWBhAAAMwWIZM=',
  channelId: 'sample',
};

export default function App() {
  return (
    <Call
      config={config}
      videoIconContainer={undefined}
      videoCallIcon={undefined}
      videoCallIconStyle={undefined}
    />
  );
}

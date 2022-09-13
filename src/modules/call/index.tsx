import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import RtcEngine, {
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
} from 'react-native-agora';

import requestCameraAndAudioPermission from '../../components/Permission';
import styles from '../../components/Style';

const config = {
  appId: '8c7c96fa8c0546db919c842a796cff88',
  token:
    '007eJxTYHjiolahkxn9/Gegk0fbnUMznuqKnpl788MDhWcbHVa8zjyqwGCRbJ5saZaWaJFsYGpilpJkaWiZbGFilGhuaZaclmZhkc+jkPw+VjH5VMphBiYGRjAE8VkYSlKLSxgYWBlAAAD0kyOh',
  channelName: 'test',
};

const Call = () => {
  const _engine = useRef<RtcEngine | null>(null);
  const [isJoined, setJoined] = useState(false);
  const [peerIds, setPeerIds] = useState<number[]>([]);

  useEffect(() => {
    if (Platform.OS == 'android') {
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const {appId} = config;
      _engine.current = await RtcEngine.create(appId);
      await _engine.current.enableAudio();
      await _engine.current.enableVideo();
      await _engine.current.setVideoEncoderConfiguration({
        dimensions: {width: 180,height: 320,} ,
        mirrorMode: 1,
        orientationMode: 2,
        degradationPrefer: 2,
      });

      _engine.current.addListener('Warning', warn => {
        console.log('Warning', warn);
      });

      _engine.current.addListener('Error', err => {
        console.log('Error', err);
      });

      _engine.current.addListener('UserJoined', (uid, elapsed) => {
        console.log('UserJoined', uid, elapsed);
        if (peerIds.indexOf(uid) === -1) {
          setPeerIds(prev => [...prev, uid]);
        }
      });

      _engine.current.addListener('UserOffline', (uid, reason) => {
        console.log('UserOffline', uid, reason);
        setPeerIds(prev => prev.filter(id => id !== uid));
      });

      _engine.current.addListener(
        'JoinChannelSuccess',
        (channel, uid, elapsed) => {
          console.log('JoinChannelSuccess', channel, uid, elapsed);
          setJoined(true);
        },
      );
    };
    init();
  }, []);

  const startCall = async () => {
    await _engine.current?.joinChannel(
      config.token,
      config.channelName,
      null,
      0,
    );
  };

  const endCall = async () => {
    await _engine.current?.leaveChannel();
    setPeerIds([]);
    setJoined(false);
  };

  const _renderVideos = () => {
    return isJoined ? (
      <View style={styles.fullView}>
        <RtcLocalView.SurfaceView
          style={styles.max}
          channelId={config.channelName}
          renderMode={VideoRenderMode.FILL}
        />
        {_renderRemoteVideos()}
        <View
          style={{
            height: 50,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              _engine.current?.switchCamera();
            }}
          >
            <Text style={styles.buttonText}>
              Switch Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={endCall} style={styles.button}>
            <Text style={styles.buttonText}> End Call </Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : null;
  };

  const _renderRemoteVideos = () => {
    return (
      <FlatList
        data={peerIds}
        renderItem={({item, index}) => {
          return (
            <SafeAreaView>
            <View style={{borderWidth: 2}} key={index}>
              <RtcRemoteView.SurfaceView
                key={index.toString()}
                style={styles.remote}
                uid={item}
                channelId={config.channelName}
                renderMode={VideoRenderMode.Hidden}
                zOrderMediaOverlay={true}
              />
            </View>
            </SafeAreaView>
          );
        }}
        contentContainerStyle={styles.padding}
        style={styles.remoteContainer}
        horizontal
      />
      // <ScrollView
      //   style={styles.remoteContainer}
      //   contentContainerStyle={styles.padding}
      //   horizontal={true}>
      //   {peerIds.map((item, index) => {
      //     return (
      //       <View style={{borderWidth: 2}} key={index}>
      //         <RtcRemoteView.SurfaceView
      //           key={index.toString()}
      //           style={styles.remote}
      //           uid={item}
      //           channelId={config.channelName}
      //           renderMode={VideoRenderMode.Hidden}
      //           zOrderMediaOverlay={true}
      //         />
      //       </View>
      //     );
      //   })}
      // </ScrollView>
    );
  };

  return (
    <View style={styles.max}>
      <View style={styles.max}>
        {isJoined ? (
          _renderVideos()
        ) : (
          <View style={styles.buttonHolder}>
            <TouchableOpacity onPress={startCall} style={styles.button}>
              <Text style={styles.buttonText}> Start Call </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default Call;

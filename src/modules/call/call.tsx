import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Button,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import RtcEngine, {
  ChannelProfile,
  ClientRole,
  RtcEngineContext,
  RtcLocalView,
  RtcRemoteView,
} from 'react-native-agora';

const config = {
  appId: '8c7c96fa8c0546db919c842a796cff88',
  token:
    '007eJxTYPjE4vv65sWq+w+39L32dvHu53xwU7Dr5Wvd0oslQhYtl7kUGCySzZMtzdISLZINTE3MUpIsDS2TLUyMEs0tzZLT0iwsbFIVk3dvU0pu31/MysTACIYgPhtDcWJuQU4qAwMrAwgAADguI/I=',
  channelId: 'sample',
};

export default function Call() {
  const [channelId, setChannelId] = useState(config.channelId);
  const [isJoined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<any>([]);
  const [startPreview, setStartPreview] = useState(false);
  const [switchCamera, setSwitchCamera] = useState(false);
  const [switchRender, setSwitchRender] = useState(true);
  const [isRenderTextureView, setIsRenderView] = useState(false);

  let _engine = useRef<RtcEngine | null>(null);

  const _initEngine = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
      ]);
    }

    _engine.current = await RtcEngine.createWithContext(
      new RtcEngineContext(config.appId),
    );
    _addListeners();

    await _engine.current?.enableVideo();
    await _engine.current?.setChannelProfile(ChannelProfile.LiveBroadcasting);
    await _engine.current?.setClientRole(ClientRole.Broadcaster);
    await _engine.current?.startPreview();
    setStartPreview(true);
  };

  const _addListeners = () => {
    _engine.current?.addListener('Warning', (warningCode: any) => {
      console.info('Warning', warningCode);
    });
    _engine.current?.addListener('Error', (errorCode: any) => {
      console.info('Error', errorCode);
    });
    _engine.current?.addListener(
      'JoinChannelSuccess',
      (channel: any, uid: any, elapsed: any) => {
        console.info('JoinChannelSuccess', channel, uid, elapsed);
        setJoined(true);
      },
    );
    _engine.current?.addListener('LeaveChannel', (stats: any) => {
      console.info('LeaveChannel', stats);
      setJoined(false);
      setRemoteUid([]);
    });
    _engine.current?.addListener('UserJoined', (uid: any, elapsed: any) => {
      console.info('UserJoined', uid, elapsed);
      setRemoteUid([...remoteUid, uid]);
      setRemoteUid([...remoteUid, uid]);
    });
    _engine.current?.addListener('UserOffline', (uid: any, reason: any) => {
      console.info('UserOffline', uid, reason);
      setRemoteUid(remoteUid.filter((value: any) => value !== uid));
    });
  };

  const _joinChannel = async () => {
    await _engine.current?.joinChannel(config.token, channelId, null, 0);
    await _engine.current?.enableVideo();
  };

  useLayoutEffect(() => {
    _initEngine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      _engine.current?.destroy();
    };
  }, []);

  const _leaveChannel = async () => {
    await _engine.current?.leaveChannel();
    await _engine.current?.disableVideo();
  };

  const _switchCamera = () => {
    _engine.current
      ?.switchCamera()
      .then(() => {
        setSwitchCamera(!switchCamera);
      })
      .catch((err: any) => {
        console.warn('switchCamera', err);
      });
  };

  const _switchRender = () => {
    setSwitchRender(!switchRender);
    setRemoteUid(remoteUid.reverse());
  };

  const _switchRenderView = (value: boolean) => {
    setIsRenderView(value);
  };

  const _renderVideo = () => {
    return (
      <View style={styles.container}>
        {startPreview ? (
          <>
            {isRenderTextureView ? (
              <RtcLocalView.TextureView style={styles.local} />
            ) : (
              <RtcLocalView.SurfaceView style={styles.local} />
            )}
          </>
        ) : undefined}
        {remoteUid !== undefined && (
          <ScrollView horizontal={true} style={styles.remoteContainer}>
            {remoteUid.map(
              (value: number, index: React.Key | null | undefined) => (
                <TouchableOpacity
                  key={index}
                  style={styles.remote}
                  onPress={_switchRender}>
                  {isRenderTextureView ? (
                    <RtcRemoteView.TextureView
                      style={styles.container}
                      uid={value}
                    />
                  ) : (
                    <RtcRemoteView.SurfaceView
                      style={styles.container}
                      uid={value}
                      zOrderMediaOverlay={true}
                    />
                  )}
                </TouchableOpacity>
              ),
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TextInput
          style={styles.input}
          onChangeText={text => setChannelId(text)}
          placeholder={'Channel ID'}
          value={channelId}
        />
        <Button
          onPress={isJoined ? _leaveChannel : _joinChannel}
          title={`${isJoined ? 'Leave' : 'Join'} channel`}
        />
      </View>
      {/* {Platform.OS === 'android' && (
        <Item
          title={'Rendered By TextureView (Default SurfaceView):'}
          isShowSwitch
          onSwitchValueChange={_switchRenderView}
        />
      )} */}
      {_renderVideo()}
      <View style={styles.float}>
        <Button
          onPress={_switchCamera}
          title={`Camera ${switchCamera ? 'front' : 'rear'}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  float: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  top: {
    width: '100%',
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    color: 'black',
  },
  local: {
    flex: 1,
  },
  remoteContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  remote: {
    width: 120,
    height: 120,
  },
});

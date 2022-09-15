import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Button,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {styles} from './styles';
import Modal from 'react-native-modal';

import RtcEngine, {
  ChannelProfile,
  ClientRole,
  RtcEngineContext,
  RtcLocalView,
  RtcRemoteView,
} from 'react-native-agora';
import {LocalImages} from '../../utils/constant/LocalImages';

interface config {
  appId: string; // AppID of the App registered on Agora
  channelId: string; // Channel Id Provided by Agora
  token: string; // Channel Token Provided by Agora
}

interface CallProps {
  config: config;
  joinScreenContainerStyle?: any; // Join Screen Container Style
  imageContainerStyle?: any; //(Optional) Image Container Style Object
  imageStyle?: any; //(Optional) Image Style Object
  videoIconContainer?: any; //(Optional) Video Icon Container Style
  audioIconContainer?: any; //(Optional) Video Icon Container Style
  videoCallIcon?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
  audioCallIcon?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
  audioCallIconStyle?: any; //(Optional) Video Icon Styling
  videoCallIconStyle?: any; //(Optional) Video Icon Styling
  image?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
}

export default function Call(props: CallProps) {
  const [isJoined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<any>([]);
  const [startPreview, setStartPreview] = useState(false);
  const [switchCamera, setSwitchCamera] = useState(false);
  const [switchRender, setSwitchRender] = useState(true);

  let _engine = useRef<RtcEngine | null>(null);

  const _initEngine = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
      ]);
    }

    _engine.current = await RtcEngine.createWithContext(
      new RtcEngineContext(props.config.appId),
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

  const _joinVideoChannel = async () => {
    await _engine.current?.joinChannel(
      props.config.token,
      props.config.channelId,
      null,
      0,
    );
    await _engine.current?.enableVideo();
  };

  const _joinAudioChannel = async () => {
    await _engine.current?.joinChannel(
      props.config.token,
      props.config.channelId,
      null,
      0,
    );
    await _engine.current?.disableVideo();
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

  const _renderVideo = () => {
    return (
      <View style={styles.container}>
        {startPreview ? (
          <RtcLocalView.SurfaceView style={styles.local} />
        ) : undefined}
        {remoteUid !== undefined && (
          <ScrollView horizontal={true} style={styles.remoteContainer}>
            {remoteUid.map(
              (value: number, index: React.Key | null | undefined) => (
                <TouchableOpacity
                  key={index}
                  style={styles.remote}
                  onPress={_switchRender}>
                  <RtcRemoteView.SurfaceView
                    style={styles.container}
                    uid={value}
                    zOrderMediaOverlay={true}
                  />
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
      <Modal
        isVisible={isJoined}
        animationIn={'lightSpeedIn'}
        animationOut={'lightSpeedOut'}
        style={styles.modalView}>
        <View style={styles.top}>
          <View>
            <View style={styles.imageContainer}>
              {props?.image && (
                <Image
                  source={props.image}
                  style={[styles.userImg, props.imageStyle]}
                />
              )}
            </View>
          </View>
        </View>
        <Button onPress={_leaveChannel} title={'Leave channel'} />
        {_renderVideo()}
        <View style={styles.float}>
          <Button
            onPress={_switchCamera}
            title={`Camera ${switchCamera ? 'front' : 'rear'}`}
          />
        </View>
      </Modal>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={
            props?.audioIconContainer
              ? props?.audioIconContainer
              : styles.audioIconContainer
          }
          onPress={_joinAudioChannel}>
          <Image
            source={
              props?.audioCallIcon ? props?.audioCallIcon : LocalImages.audio
            }
            style={
              props?.audioCallIconStyle
                ? props.audioCallIconStyle
                : styles.audioIcon
            }
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={
            props?.videoIconContainer
              ? props?.videoIconContainer
              : styles.videoIconContainer
          }
          onPress={_joinVideoChannel}>
          <Image
            source={
              props?.videoCallIcon ? props?.videoCallIcon : LocalImages.video
            }
            style={
              props?.videoCallIconStyle
                ? props.videoCallIconStyle
                : styles.videoIcon
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

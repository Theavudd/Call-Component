import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Image,
  ImageStyle,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
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
import localImages from '../../utils/localImages';
import {LocalStrings} from '../../utils/constant/LocalStrings';
import {showSnackBar} from '../../utils/CommonFunctions';
import { BlurView } from '@react-native-community/blur';

interface config {
  appId: string; // AppID of the App registered on Agora
  channelId: string; // Channel Id Provided by Agora
  token: string; // Channel Token Provided by Agora
}

interface CallProps {
  config: config; // Config file for Agora
  joinScreenContainerStyle?: any; // Join Screen Container Style
  imageContainerStyle?: any; //(Optional) Image Container Style Object
  imageStyle?: any; //(Optional) Image Style Object
  videoIconContainer?: any; //(Optional) Video Icon Container Style
  audioIconContainer?: any; //(Optional) Video Icon Container Style
  videoCallIcon?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
  audioCallIcon?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
  audioCallIconStyle?: ImageStyle; //(Optional) Video Icon Styling
  videoCallIconStyle?: ImageStyle; //(Optional) Video Icon Styling
  profileName: string; //Name of the Profile
  profileImage?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
}

export default function Call(props: CallProps) {
  const [mute, setMute] = useState(false);
  const [camera, setCamera] = useState(true);
  const [speaker, setSpeaker] = useState(true);
  const [isJoined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<any>([]);
  const [isConnected, setConnected] = useState(false);
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
    try {
      await _engine.current?.joinChannel(
        props.config.token,
        props.config.channelId,
        null,
        0,
      );
      setCamera(true);
      setConnected(true);
      await _engine.current?.enableVideo();
    } catch (error: any) {
      showSnackBar(error.message);
    }
  };

  const _joinAudioChannel = async () => {
    try {
      await _engine.current?.joinChannel(
        props.config.token,
        props.config.channelId,
        null,
        0,
      );
      setCamera(false);
      await _engine.current?.disableVideo();
    } catch (error: any) {
      showSnackBar(error.message);
    }
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
    try {
      await _engine.current?.leaveChannel();
      setConnected(false);
      await _engine.current?.disableVideo();
    } catch (error: any) {
      showSnackBar(error.message);
    }
  };

  const _switchCamera = () => {
    _engine.current
      ?.switchCamera()
      .then(() => {
        setSwitchCamera(!switchCamera);
      })
      .catch((error: any) => {
        showSnackBar(error.message);
        console.warn('switchCamera', error);
      });
  };

  const _switchRender = () => {
    setSwitchRender(!switchRender);
    setRemoteUid(remoteUid.reverse());
  };

  const _renderVideo = () => {
    return (
      <View style={styles.container}>
        
        {remoteUid !== undefined && (
          // remoteUid.map(
          //   (value: number, index: React.Key | null | undefined) => (
          //     <TouchableOpacity
          //       key={index}
          //       style={styles.singleRemote}
          //       onPress={_switchRender}>
          //       <RtcRemoteView.SurfaceView
          //         style={{flex: 1,zIndex: 2,elevation: 2,}}
          //         uid={value}
          //         zOrderMediaOverlay={true}
          //       />
          //     </TouchableOpacity>
          //   ),
          // )
          <View style={styles.remoteContainer}>
            {remoteUid.map(
              (value: number, index: React.Key | null | undefined) => (
                <TouchableOpacity
                  key={index}
                  style={styles.singleRemote}
                  onPress={_switchRender}>
                  <RtcRemoteView.SurfaceView
                    style={[styles.container,]}
                    uid={value}
                  />
                </TouchableOpacity>
              ),
            )}
          </View>
        )}
        {startPreview ? (
          <>
          <RtcLocalView.SurfaceView style={styles.local} zOrderMediaOverlay zOrderOnTop />
          {/* <BlurView style={{height: '100%',width: '100%',}} blurAmount={1} blurType='dark' blurRadius={24} /> */}
          </>
        ) : undefined}
      </View>
    );
  };

  const toggleMute = async () => {
    try {
      await _engine.current?.muteLocalAudioStream(!mute);
      setMute(!mute);
    } catch (error: any) {
      showSnackBar(error.message);
    }
  };

  const toggleCamera = async () => {
    try {
      await _engine.current?.enableLocalVideo(!camera);
      setCamera(!camera);
    } catch (error: any) {
      showSnackBar(error.message);
    }
  };

  const toggleSpeaker = async () => {
    // await _engine.current?.
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        isVisible={isJoined}
        animationIn={'lightSpeedIn'}
        animationOut={'lightSpeedOut'}
        style={styles.modalView}>
        {_renderVideo()}
        <View style={styles.profileContainer}>
          <Image source={props.profileImage} style={styles.profileImage} />
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{props?.profileName}</Text>
            <Text style={styles.connectingText}>{`${
              isConnected ? LocalStrings.connected : LocalStrings.connecting
            }`}</Text>
          </View>
        </View>

        <View style={styles.modalBottomContainer}>
          {/* <BlurView style={{
            height: 220,
            width: '100%',
            position: 'absolute',
            bottom: 0,
            zIndex: 1,
            elevation: 1,
            opacity: 0.6,
          }} blurAmount={3} blurType='dark' blurRadius={24} /> */}
          <View style={styles.buttonParentContainer}>
            <View style={styles.roundButtonContainer}>
              <TouchableOpacity
                onPress={toggleMute}
                activeOpacity={0.8}
                style={
                  !mute
                    ? styles.roundButton
                    : [styles.roundButton, {backgroundColor: 'white'}]
                }>
                <Image
                  source={localImages.MUTE_MIC}
                  style={
                    !mute
                      ? styles.roundButtonIcon
                      : [styles.roundButtonIcon, {tintColor: 'black'}]
                  }
                />
              </TouchableOpacity>
              <Text style={styles.buttonText}>{LocalStrings.mute}</Text>
            </View>
            <View style={styles.roundButtonContainer}>
              <TouchableOpacity
                onPress={toggleCamera}
                activeOpacity={0.8}
                style={
                  camera
                    ? styles.roundButton
                    : [styles.roundButton, {backgroundColor: 'white'}]
                }>
                <Image
                  source={localImages.Camera_OFF}
                  style={
                    camera
                      ? styles.roundButtonIcon
                      : [styles.roundButtonIcon, {tintColor: 'black'}]
                  }
                />
              </TouchableOpacity>
              <Text style={styles.buttonText}> {LocalStrings.CameraOff} </Text>
            </View>
            <View style={styles.roundButtonContainer}>
              <TouchableOpacity
                onPress={_switchCamera}
                style={styles.roundButton}>
                <Image
                  source={localImages.FLIP_CAMERA}
                  style={styles.roundButtonIcon}
                />
              </TouchableOpacity>
              <Text style={styles.buttonText}> {LocalStrings.flip} </Text>
            </View>
            <View style={styles.roundButtonContainer}>
              <TouchableOpacity
                onPress={toggleSpeaker}
                activeOpacity={0.8}
                style={
                  speaker
                    ? styles.roundButton
                    : [styles.roundButton, {backgroundColor: 'white'}]
                }>
                <Image
                  source={localImages.SPEAKER}
                  style={
                    speaker
                      ? styles.roundButtonIcon
                      : [styles.roundButtonIcon, {tintColor: 'black'}]
                  }
                />
              </TouchableOpacity>
              <Text style={styles.buttonText}> {LocalStrings.speaker} </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={_leaveChannel}
            style={styles.endcallButton}>
            <Image source={localImages.END_CALL} style={styles.endcallIcon} />
          </TouchableOpacity>
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
          style={[styles.videoIconContainer, props?.videoIconContainer]}
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
    </SafeAreaView>
  );
}

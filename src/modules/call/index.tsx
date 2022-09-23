import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Image,
  ImageStyle,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
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
import localImages from '../../utils/localImages';
import {LocalStrings} from '../../utils/constant/LocalStrings';
import {showSnackBar} from '../../utils/CommonFunctions';

import FunctionButtons from '../../components/functionButtons';
import ImageButton from '../../components/ImageButton';

interface config {
  appId: string; // AppID of the App registered on Agora
  channelId: string; // Channel Id Provided by Agora
  token: string; // Channel Token Provided by Agora
}

interface CallProps {
  config: config; // Config file for Agora
  joinScreenContainerStyle?: StyleProp<ViewStyle> | undefined; // Join Screen Container Style
  imageContainerStyle?: StyleProp<ViewStyle> | undefined; //(Optional) Image Container Style Object
  imageStyle?: StyleProp<ImageStyle> | undefined; //(Optional) Image Style Object
  videoIconContainerStyle?: StyleProp<ViewStyle> | undefined; //(Optional) Video Icon Container Style
  audioIconContainerStyle?: StyleProp<ViewStyle> | undefined; //(Optional) Video Icon Container Style
  videoCallIcon?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
  audioCallIcon?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
  audioCallIconStyle?: StyleProp<ImageStyle> | undefined; //(Optional) Video Icon Styling
  videoCallIconStyle?: StyleProp<ImageStyle> | undefined; //(Optional) Video Icon Styling
  profileName: string; //Name of the Profile
  profileImage?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
}

export default function Call(props: CallProps) {
  const [mute, setMute] = useState(false);
  const [camera, setCamera] = useState(true);
  const [speaker, setSpeaker] = useState(false);
  const [isJoined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<any>([]);
  const [isConnected, setConnected] = useState(false);
  const [startPreview, setStartPreview] = useState(false);
  const [switchCamera, setSwitchCamera] = useState(false);
  const [switchRender, setSwitchRender] = useState(true);
  const [isAudioCall, setAudioCall] = useState(false);

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
    });
    _engine.current?.addListener('UserOffline', (uid: any, reason: any) => {
      console.info('UserOffline', uid, reason);
      setRemoteUid(remoteUid.filter((value: any) => value !== uid));
    });
    // _engine.current?.addListener('RemoteVideoStateChanged', (uid: any, reason: any) => {
    //   console.info('RemoteVideoStateChanged', uid, reason);
    //   setRemoteUid(remoteUid.filter((value: any) => value !== uid));
    // });
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
      setJoined(true);
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
      setConnected(true);
      setAudioCall(true);
      await _engine.current?.disableVideo();
    } catch (error: any) {
      showSnackBar(error.message);
    }
  };

  useLayoutEffect(() => {
    _initEngine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log('remoteUid', remoteUid);

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
    console.log('pressed');
    setRemoteUid(remoteUid.reverse());
  };

  const _renderVideo = () => {
    return (
      <View style={styles.container}>
        {isAudioCall ? (
          <View style={{height: '100%',width: '100%',alignItems: 'center',justifyContent: 'center',backgroundColor: 'white',}} >
          <Image source={props.profileImage} style={{width: '100%', resizeMode: 'contain',backgroundColor: 'white',  }} blurRadius={10} />
          </View>
        ) : (
          <>
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
                        style={[styles.container]}
                        uid={value}
                      />
                    </TouchableOpacity>
                  ),
                )}
              </View>
            )}
            {startPreview ? (
              <>
                <RtcLocalView.SurfaceView
                  style={styles.local}
                  zOrderMediaOverlay
                  zOrderOnTop
                />
                {/* <BlurView style={{height: '100%',width: '100%',}} blurAmount={1} blurType='dark' blurRadius={24} /> */}
              </>
            ) : undefined}
          </>
        )}
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
      setAudioCall(false)
    } catch (error: any) {
      showSnackBar(error.message);
    }
  };

  const toggleSpeaker = async () => {
    try {
      await _engine.current?.setEnableSpeakerphone(speaker);
      setSpeaker(!speaker);
    } catch (error: any) {
      showSnackBar(error.message);
    }
  };

  // renderAudio=()=>{

  // }

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
              isConnected
                ? remoteUid.length === 0
                  ? LocalStrings.ringing
                  : LocalStrings.connected
                : LocalStrings.connecting
            }`}</Text>
          </View>
        </View>

        <View style={styles.modalBottomContainer}>
          <View style={styles.buttonParentContainer}>
            <FunctionButtons
              functionState={mute}
              functionMethod={toggleMute}
              image={localImages.MUTE_MIC}
              text={LocalStrings.mute}
            />
            <FunctionButtons
              functionState={!camera}
              functionMethod={toggleCamera}
              image={localImages.CAMERA_OFF}
              text={LocalStrings.CameraOff}
            />
            <ImageButton
              text={LocalStrings.flip}
              textStyle={styles.buttonText}
              containerStyling={styles.roundButton}
              image={localImages.FLIP_CAMERA}
              ImageStyle={styles.roundButtonIcon}
              onPressFunction={_switchCamera}
            />
            <FunctionButtons
              functionState={speaker}
              functionMethod={toggleSpeaker}
              image={localImages.SPEAKER}
              text={LocalStrings.speaker}
            />
          </View>
          <TouchableOpacity
            onPress={_leaveChannel}
            style={styles.endcallButton}>
            <Image source={localImages.END_CALL} style={styles.endcallIcon} />
          </TouchableOpacity>
        </View>
      </Modal>
      <View style={styles.buttonsContainer}>
        <ImageButton
          containerStyling={[
            props?.audioIconContainerStyle
              ? props?.audioIconContainerStyle
              : styles.audioIconContainer,
          ]}
          image={
            props?.audioCallIcon ? props?.audioCallIcon : localImages.AUDIO
          }
          ImageStyle={
            props?.audioCallIconStyle
              ? props.audioCallIconStyle
              : styles.audioIcon
          }
          onPressFunction={_joinAudioChannel}
        />
        <ImageButton
          containerStyling={[
            styles.videoIconContainer,
            props?.videoIconContainerStyle,
          ]}
          image={
            props?.videoCallIcon ? props?.videoCallIcon : localImages.VIDEO
          }
          ImageStyle={
            props?.videoCallIconStyle
              ? props.videoCallIconStyle
              : styles.videoIcon
          }
          onPressFunction={_joinVideoChannel}
        />
      </View>
    </SafeAreaView>
  );
}

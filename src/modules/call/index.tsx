import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Image,
  ImageBackground,
  ImageStyle,
  PermissionsAndroid,
  Platform,
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
  type: string; //container type of call 'audio' or 'video'
  profileName: string; //Name of the Profile
  profileImage?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
  isCallActive: boolean; //status of call on recievers end
  onEndCall: Function; // Runs when the call is ended
  onAudioCallPress: Function; //Generate audio Call token here
  onVideoCallPress: Function; //Generate Video Call token here
  joinScreenContainerStyle?: StyleProp<ViewStyle>; // Join Screen Container Style
  imageContainerStyle?: StyleProp<ViewStyle>; //(Optional) Image Container Style Object
  imageStyle?: StyleProp<ImageStyle>; //(Optional) Image Style Object
  videoIconContainerStyle?: StyleProp<ViewStyle>; //(Optional) Video Icon Container Style
  audioIconContainerStyle?: StyleProp<ViewStyle>; //(Optional) Video Icon Container Style
  videoCallIcon?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
  audioCallIcon?: any; //(Optional) Image URI OR Local location of the image (require keyword is required in case of local image)
  audioCallIconStyle?: StyleProp<ImageStyle>; //(Optional) Audio Icon Styling
  videoCallIconStyle?: StyleProp<ImageStyle>; //(Optional) Video Icon Styling
}

export default function Call(props: CallProps) {
  const [mute, setMute] = useState(false);
  const [camera, setCamera] = useState(true);
  const [speaker, setSpeaker] = useState(false);
  const [isJoined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<any>([]);
  const [isConnected, setConnected] = useState(false);
  const [switchRender, setSwitchRender] = useState(true);
  const [startPreview, setStartPreview] = useState(false);
  const [switchCamera, setSwitchCamera] = useState(false);

  let _engine = useRef<RtcEngine | null>(null);

  const _initEngine = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
      ])
        .then(resp => {
          console.log('response', resp);
        })
        .catch(err => {
          console.log('error occured', err);
        });
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
    _engine.current?.addListener('Warning', (warningCode: any) => {});
    _engine.current?.addListener('Error', (errorCode: any) => {
      if (errorCode == 1501) {
        showSnackBar(
          'Camera and Microphone access is not granted. Please provide permission from settings',
        );
      }
    });
    _engine.current?.addListener(
      'JoinChannelSuccess',
      (channel: any, uid: any, elapsed: any) => {
        setJoined(true);
      },
    );
    _engine.current?.addListener('LeaveChannel', (stats: any) => {
      setJoined(false);
      setRemoteUid([]);
    });
    _engine.current?.addListener('UserJoined', (uid: any, elapsed: any) => {
      setRemoteUid([...remoteUid, uid]);
    });
    _engine.current?.addListener('UserOffline', (uid: any, reason: any) => {
      setRemoteUid(remoteUid.filter((value: any) => value !== uid));
    });
  };

  const _joinVideoChannel = async () => {
    try {
      setJoined(true);
      await props?.onVideoCallPress();
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
      setJoined(true);
      await props?.onAudioCallPress();
      await _engine.current?.disableVideo();
      await _engine.current?.joinChannel(
        props.config.token,
        props.config.channelId,
        null,
        0,
      );
      setCamera(false);
      setConnected(true);
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
      setJoined(false);
      props.onEndCall();
      await _engine.current?.leaveChannel();
      setConnected(false);
      await _engine.current?.disableVideo();
      await props.onEndCall();
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
      });
  };

  const _switchRender = () => {
    setSwitchRender(!switchRender);
    setRemoteUid(remoteUid.reverse());
  };

  const _renderVideo = () => {
    return (
      <View style={styles.container}>
        {props.type == 'audio' ? (
          <View style={styles.profileImageContainer}>
            <Image
              source={props.profileImage ? props.profileImage : require('../../assets/images/img.jpeg')}
              style={styles.profileIconImage}
              blurRadius={10}
            />
          </View>
        ) : (
          <>
            {remoteUid !== undefined && (
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
                <RtcLocalView.SurfaceView
                  style={styles.local}
                  zOrderMediaOverlay
                  zOrderOnTop
                />
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

  return (
    <View style={styles.buttonsContainer}>
      <Modal isVisible={props.isCallActive} style={styles.modalView}>
        <View
          style={styles.incomingCallView}>

          <View style={styles.profileContainer}>
            <Image
              source={{uri: props?.profileImage}}
              style={styles.profileImage}
            />
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
          <View style={styles.callBottonContainer} >
            <TouchableOpacity activeOpacity={0.8} onPress={_leaveChannel} style={styles.declineCall} >
              <Image source={localImages.END_CALL} style={styles.endcallIcon} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={props.type === 'audio' ? _joinAudioChannel : _joinVideoChannel} style={styles.acceptCall} >
            <Image source={localImages.END_CALL} style={[styles.endcallIcon,styles.rotate]} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        isVisible={props.isCallActive ? isJoined : false}
        animationIn={'lightSpeedIn'}
        animationOut={'lightSpeedOut'}
        style={styles.modalView}>
        {remoteUid.length === 0 ? (
          <ImageBackground
            source={{uri: props?.profileImage}}
            style={styles.imageBackgroundContainer}
            blurRadius={7}
          />
        ) : (
          _renderVideo()
        )}
        <View style={styles.profileContainer}>
          <Image
            source={{uri: props?.profileImage}}
            style={styles.profileImage}
          />
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
          <ImageButton
            onPressFunction={_leaveChannel}
            ImageStyle={styles.endcallIcon}
            image={localImages.END_CALL}
            containerStyling={styles.endcallButton}
          />
        </View>
      </Modal>
      <TouchableOpacity />
      <ImageButton
        containerStyling={[
          styles.audioIconContainer,
          props.audioIconContainerStyle,
        ]}
        image={props?.audioCallIcon ? props?.audioCallIcon : localImages.AUDIO}
        ImageStyle={[props.audioCallIconStyle, styles.audioIcon]}
        onPressFunction={_joinAudioChannel}
      />
      <ImageButton
        containerStyling={[
          styles.videoIconContainer,
          props.videoIconContainerStyle,
        ]}
        image={props?.videoCallIcon ? props?.videoCallIcon : localImages.VIDEO}
        ImageStyle={[props.videoCallIconStyle, styles.videoIcon]}
        onPressFunction={_joinVideoChannel}
      />
    </View>
  );
}

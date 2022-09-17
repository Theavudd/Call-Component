import {StyleSheet} from 'react-native';
import {vh, vw} from '../../utils/Dimension';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  userImg: {
    height: '100%',
    width: '100%',
    backgroundColor: 'red',
  },
  imageContainer: {
    height: vh(100),
    width: vw(100),
  },
  float: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  top: {
    width: '100%',
    position: 'absolute',
    top: vh(100),
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
    width: vw(120),
    height: vh(120),
  },
  joinScreenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  videoIcon: {
    height: '100%',
    width: '100%',
  },
  videoIconContainer: {
    height: vh(25),
    width: vw(25),
    marginHorizontal: vw(5),
  },
  audioIcon: {
    height: '100%',
    width: '100%',
  },
  audioIconContainer: {
    height: vh(25),
    width: vw(25),
    marginHorizontal: vw(10),
  },
  modalView: {
    margin: 0,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

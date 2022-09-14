import {Dimensions, StyleSheet} from 'react-native';

const dimensions = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

export default StyleSheet.create({
  max: {
    flex: 1,
  },
  buttonHolder: {
    height: 100,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0093E9',
    borderRadius: 25,
    zIndex: 10,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
  },
  fullView: {
    width: dimensions.width,
    height: dimensions.height,
    borderWidth: 5,
  },
  remoteContainer: {
    width: '100%',
    height: 160,
    position: 'absolute',
    top: 5,
  },
  remote: {
    width: 90,
    height: 160,
    marginHorizontal: 2.5,
  },
  noUserText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#0093E9',
  },
  padding: {
    paddingHorizontal: 2.5,
  },
  buttonContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

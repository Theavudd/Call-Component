import Snackbar from 'react-native-snackbar';

export const showSnackBar = (message: string) => {
  Snackbar.show({
    text: message,
    backgroundColor: 'black',
    duration: 1000,
    textColor: 'white',
  });
};

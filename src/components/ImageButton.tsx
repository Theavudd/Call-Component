import {Image, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import React from 'react';

interface ImageButtonProps {
  text?: String;
  textStyle?: any;
  outerContainer?: any;
  containerStyling: any;
  image: any;
  ImageStyle: any;
  onPressFunction: Function;
}

export default function ImageButton({
  text,
  textStyle,
  containerStyling,
  image,
  outerContainer,
  ImageStyle,
  onPressFunction,
}: ImageButtonProps) {
  return (
    <View style={outerContainer ? outerContainer : styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={containerStyling}
        onPress={() => onPressFunction()}>
        <Image source={image} style={ImageStyle} />
      </TouchableOpacity>
      {text && <Text style={textStyle}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

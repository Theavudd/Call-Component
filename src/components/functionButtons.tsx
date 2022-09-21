import {View, Text, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {styles} from '../modules/call/styles';

interface Props {
  image: any;
  text: String;
  functionState: boolean;
  functionMethod: Function;
}

export default function FunctionButtons({
  text,
  image,
  functionState,
  functionMethod,
}: Props) {
  return (
    <View style={styles.roundButtonContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => functionMethod()}
        style={
          !functionState
            ? styles.roundButton
            : [styles.roundButton, {backgroundColor: 'white'}]
        }>
        <Image
          source={image}
          style={
            !functionState
              ? styles.roundButtonIcon
              : [styles.roundButtonIcon, {tintColor: 'black'}]
          }
        />
      </TouchableOpacity>
      <Text style={styles.buttonText}>{text}</Text>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/userSlice';

const NicknameScreen: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);

  const handleDone = () => {
    if (nickname) {
      dispatch(setUser({ ...user, name: nickname }));
      navigation.navigate('RegionSelectionScreen' as never); // Change to next screen name as needed
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your nickname</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your nickname"
        placeholderTextColor="#94A3B8"
        value={nickname}
        onChangeText={setNickname}
        maxLength={60}
      />
      <TouchableOpacity
        style={[styles.doneButton, !nickname && { opacity: 0.5 }]}
        onPress={handleDone}
        disabled={!nickname}
      >
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#23272F',
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: '#F8FAFC',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#23272F',
  },
  doneButton: {
       backgroundColor: '#4ECDC4',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  doneText: {
    color: '#0F1419',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default NicknameScreen;

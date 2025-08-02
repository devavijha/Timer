import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const regions = [
  { name: 'INDIA', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
  { name: 'SOUTH KOREA', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
  { name: 'JAPAN', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
  { name: 'HONGKONG', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
  { name: 'TAIWAN', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
  { name: 'SINGAPORE', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
  { name: 'MALAYSIA', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
  { name: 'NEPAL', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
  { name: 'MYANMAR', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
  { name: 'PHILIPPINES', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
  { name: 'THAILAND', subtitle: 'Study time resets at 5 AM.', continent: 'Asia' },
];

const RegionSelectionScreen: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Region</Text>
      <FlatList
        data={regions}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, selected === item.name && styles.selectedItem]}
            onPress={() => setSelected(item.name)}
          >
            <View style={styles.itemRow}>
              <Text style={[styles.itemText, selected === item.name && styles.selectedText]}>{item.name}</Text>
              {selected === item.name && <Text style={styles.check}>✓</Text>}
            </View>
            <Text style={styles.subtitleText}>{item.subtitle}</Text>
          </TouchableOpacity>
        )}
        style={styles.list}
      />
      <TouchableOpacity
        style={[styles.nextButton, !selected && { opacity: 0.5 }]}
        onPress={() => selected && navigation.navigate('StudyTimeScreen')}
        disabled={!selected}
      >
        <Text style={styles.nextText}>Next</Text>
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
  list: {
    marginBottom: 32,
  },
  item: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#23272F',
    backgroundColor: '#23272F',
    borderRadius: 12,
    marginBottom: 10,
  },
  selectedItem: {
    backgroundColor: '#4ECDC4',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '500',
  },
  selectedText: {
    color: '#0F1419',
    fontWeight: '700',
  },
  check: {
    color: '#0F1419',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 8,
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  nextButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  nextText: {
    color: '#0F1419',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default RegionSelectionScreen;

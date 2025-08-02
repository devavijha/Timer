import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const categories = [
  'Primary School',
  'Secondary School',
  'Middle School',
  'Higher Secondary',
  'University',
  'Language study',
  'Others',
];

const CategorySelectionScreen: React.FC<{ onDone: (selected: string) => void }> = ({ onDone }) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Category</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, selected === item && styles.selectedItem]}
            onPress={() => setSelected(item)}
          >
            <Text style={[styles.itemText, selected === item && styles.selectedText]}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.list}
      />
      <TouchableOpacity
        style={[styles.doneButton, !selected && { opacity: 0.5 }]}
        onPress={() => selected && onDone(selected)}
        disabled={!selected}
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
  itemText: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '500',
  },
  selectedText: {
    color: '#0F1419',
    fontWeight: '700',
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

export default CategorySelectionScreen;

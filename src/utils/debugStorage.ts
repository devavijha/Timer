import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug utility to check what data is currently persisted
 */
export const debugPersistedData = async (): Promise<void> => {
  try {
    console.log('\n=== PERSISTED DATA DEBUG ===');
    
    // Get all keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('All AsyncStorage keys:', allKeys);
    
    // Get all values
    const allData = await AsyncStorage.multiGet(allKeys);
    
    allData.forEach(([key, value]) => {
      try {
        const parsedValue = value ? JSON.parse(value) : null;
        console.log(`${key}:`, parsedValue);
      } catch (e) {
        console.log(`${key}:`, value); // If not JSON, show as string
      }
    });
    
    console.log('=== END DEBUG ===\n');
  } catch (error) {
    console.error('Error debugging persisted data:', error);
  }
};

/**
 * Simple function to manually save test data (for testing persistence)
 */
export const saveTestData = async (): Promise<void> => {
  try {
    const testData = {
      testTasks: [
        { id: '1', title: 'Test Task 1', completed: false },
        { id: '2', title: 'Test Task 2', completed: true }
      ],
      testHabits: [
        { id: '1', name: 'Test Habit', streak: 5 }
      ]
    };
    
    await AsyncStorage.setItem('testData', JSON.stringify(testData));
    console.log('Test data saved successfully');
  } catch (error) {
    console.error('Error saving test data:', error);
  }
};

import { useEffect } from 'react';
import { useFitbitData } from './useFitbitData';
import { useDispatch } from 'react-redux';
import { useToast } from '../hooks/useToast';

export function useBiometricReminders(fitbitToken?: string) {
  const dispatch = useDispatch();
  const fitbitData = useFitbitData(fitbitToken || '');
  const { showInfo } = useToast();

  useEffect(() => {
    // Example: trigger reminder if heart rate is high
    const heartRate = fitbitData.heartRate;
    if (heartRate > 100) {
      showInfo('Take a break! Your heart rate is high.', 'Wellness Reminder');
      // Optionally dispatch a Redux action for reminders
    }
    // Example: trigger reminder if sleep is low
    const sleep = fitbitData.sleep;
    if (sleep < 6) {
      showInfo('Try to get more sleep tonight!', 'Wellness Reminder');
    }
    // Add more wellness triggers as needed
  }, [fitbitData, dispatch]);
}

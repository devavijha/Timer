import { useEffect, useState } from 'react';

export function useFitbitData(accessToken: string) {
  const [fitbitData, setFitbitData] = useState({ steps: 0, sleep: 0, heartRate: 0 });

  useEffect(() => {
    if (!accessToken) return;
    // Example Fitbit API call for steps
    fetch('https://api.fitbit.com/1/user/-/activities/steps/date/today/1d.json', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        const stepsArr = data['activities-steps'];
        const steps = Array.isArray(stepsArr) && stepsArr.length > 0 && stepsArr[0]?.value ? stepsArr[0].value : 0;
        setFitbitData(d => ({ ...d, steps }));
      })
      .catch(() => {
        setFitbitData(d => ({ ...d, steps: 0 }));
      });
    // Add similar calls for sleep and heart rate
  }, [accessToken]);

  return fitbitData;
}

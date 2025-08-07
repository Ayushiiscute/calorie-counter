import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import React, { useRef, useState } from 'react';

import type { FC } from 'react';

interface ShareDailySummaryProps {
  userId: any;
  totalCalories: any;
}

const ShareDailySummary: FC<ShareDailySummaryProps> = ({ userId, totalCalories }) => {
  const viewShotRef = useRef<ViewShot>(null);
  const [loading, setLoading] = useState(false);

  const onShare = async () => {
    setLoading(true);
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) {
        Alert.alert('Error', 'Failed to capture view.');
        return;
      }

      const fileUri = FileSystem.documentDirectory + 'summary.png';
      await FileSystem.copyAsync({ from: uri, to: fileUri });

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(fileUri);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to share');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
        <View>
          <Text>My Calorie Summary</Text>
          <Text>User ID: {userId}</Text>
          <Text>Total Calories: {totalCalories}</Text>
        </View>
      </ViewShot>
      <Button title="Share" onPress={onShare} disabled={loading} />
      {loading && <ActivityIndicator />}
    </View>
  );
};

export default ShareDailySummary;

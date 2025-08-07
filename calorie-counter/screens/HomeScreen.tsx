import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  useColorScheme,
  Switch,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { api } from '../api';
import WeeklyGraph from './WeelkyCalorieChart';
import DailyGraph from './DailyGraph';
import { useCustomBackHandler } from '@/hooks/useCustomBackHandler';
import ShareDailySummary from '../components/ShareDailySummary';
import ConfettiCannon from 'react-native-confetti-cannon';

const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

export default function HomeScreen({ route }: any) {
  const navigation = useNavigation();
  const systemColorScheme = useColorScheme();
  const [manualDarkMode, setManualDarkMode] = useState<boolean | null>(null);
  const [intake, setIntake] = useState(Array(24).fill(''));
  const [goalHit, setGoalHit] = useState(false);

  useCustomBackHandler(navigation);

  const isDark = manualDarkMode === null ? systemColorScheme === 'dark' : manualDarkMode;
  const dailyGoal = route?.params?.calories ?? 2000;
  const userId = route?.params?.userId;

  const totalCalories = intake.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  const remainingCalories = dailyGoal - totalCalories;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Toast.show({
        type: 'info',
        text1: 'Confirm Exit',
        text2: 'Press again to go back to Welcome screen.',
      });

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' as never }],
        });
      }, 1000);

      return true;
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const fetchTodayIntake = async () => {
      try {
        const response = await api.get(`/food/${userId}/today`);
        if (response?.data?.hourlyIntake) {
          const intakeObj = response.data.hourlyIntake;
          const updatedIntake = Array(24).fill('');
          for (let i = 0; i < 24; i++) {
            if (intakeObj[i] !== undefined) {
              updatedIntake[i] = intakeObj[i].toString();
            }
          }
          setIntake(updatedIntake);
        }
      } catch (error: any) {
        console.log('No entry for today or error fetching:', error?.response?.data || error.message);
      }
    };

    if (userId) fetchTodayIntake();
  }, [userId]);

  useEffect(() => {
    if (totalCalories >= dailyGoal && !goalHit) {
      setGoalHit(true);

      Toast.show({
        type: 'success',
        text1: '🎉 You hit your goal!',
        text2: `Total: ${totalCalories} kcal`,
        position: 'top',
      });
    } else if (totalCalories < dailyGoal && goalHit) {
      setGoalHit(false);
    }
  }, [totalCalories]);

  const saveToBackend = async () => {
    try {
      const hourlyIntake = intake.map((val) => parseInt(val) || 0);
      const date = new Date().toISOString().split('T')[0];

      const updateResponse = await api.put(`/food/${userId}/today`, {
        userId,
        hourlyIntake,
        total: totalCalories,
        date,
      });

      if (updateResponse.status === 200) {
        Alert.alert('Updated', 'Today’s calorie data updated!');
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        try {
          const date = new Date().toISOString().split('T')[0];
          const hourlyIntake = intake.map((val) => parseInt(val) || 0);
          await api.post('/food', {
            userId,
            hourlyIntake,
            total: totalCalories,
            date,
          });
          Alert.alert('Saved', 'Calorie data saved!');
        } catch (e) {
          Alert.alert('Error', 'Failed to save data');
        }
      } else {
        console.error(error);
        Alert.alert('Error', 'Failed to save or update data');
      }
    }
  };

  const colors = {
    background: isDark ? '#121212' : 'white',
    text: isDark ? 'white' : 'black',
    subtitleText: isDark ? '#ccc' : 'black',
    inputBackground: isDark ? '#222' : '#f0f0f0',
    inputBorder: isDark ? '#555' : '#555',
    barColor: 'red',
    buttonBackground: isDark ? '#333' : 'black',
    buttonText: 'white',
    placeholderTextColor: isDark ? '#aaa' : '#888',
  };

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {/* 🎉 Confetti Overlay */}
      {goalHit && (
        <ConfettiCannon
          count={150}
          origin={{ x: 200, y: 0 }}
          autoStart
          fadeOut
          fallSpeed={1500}
          explosionSpeed={800}
          colors={['#FFD700', '#FF4500', '#00FF00', '#00BFFF']}
        />
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}
        style={[styles.fullScreen, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={(value) => setManualDarkMode(value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDark ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Daily Calorie Tracker</Text>
        <Text style={[styles.subtitle, { color: colors.subtitleText }]}>Goal: {dailyGoal} kcal</Text>
        <Text style={[styles.subtitle, { color: colors.subtitleText }]}>Consumed: {totalCalories} kcal</Text>
        <Text style={[styles.subtitle, { color: colors.subtitleText }]}>Remaining: {remainingCalories} kcal</Text>

        {HOURS.map((hour, index) => (
          <View key={index} style={styles.inputRow}>
            <Text style={[styles.hourLabel, { color: colors.text }]}>{hour}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              keyboardType="numeric"
              placeholder="Calories"
              placeholderTextColor={colors.placeholderTextColor}
              value={intake[index]}
              onChangeText={(val) => {
                const updated = [...intake];
                updated[index] = val;
                setIntake(updated);
              }}
            />
          </View>
        ))}

        <Text style={[styles.graphTitle, { color: colors.text }]}>Hourly Calorie Intake</Text>
        {intake.map((val, i) => (
          <View key={i} style={styles.graphRow}>
            <Text style={[styles.graphLabel, { color: colors.text }]}>{HOURS[i]}</Text>
            <View
              style={[styles.bar, { width: Math.min(parseInt(val) || 0, 250), backgroundColor: colors.barColor }]}
            />
            <Text style={[styles.graphValue, { color: colors.text }]}>{val || 0} kcal</Text>
          </View>
        ))}

        <Text style={[styles.graphTitle, { color: colors.text }]}>Daily Calorie Chart</Text>
        <DailyGraph userId={userId} />

        <Text style={[styles.graphTitle, { color: colors.text }]}>Weekly Calorie Chart</Text>
        <WeeklyGraph userId={userId} />

        <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
          <ShareDailySummary userId={userId} totalCalories={totalCalories} />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.buttonBackground }]}
          onPress={saveToBackend}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 0, margin: 0 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  toggleLabel: { fontSize: 18, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 12 },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, paddingHorizontal: 10 },
  hourLabel: { width: 60, fontWeight: '600' },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10 },
  graphTitle: { fontSize: 20, fontWeight: '700', marginTop: 25, marginBottom: 10, textAlign: 'center' },
  graphRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3, paddingHorizontal: 10 },
  graphLabel: { width: 60, fontWeight: '600' },
  bar: { height: 15, borderRadius: 6, marginHorizontal: 5 },
  graphValue: { width: 60, textAlign: 'right' },
  button: { marginHorizontal: 20, marginBottom: 40, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { fontSize: 20, fontWeight: '700' },
});

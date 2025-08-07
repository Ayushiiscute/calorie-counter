import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

const WeeklyGraph = ({ userId }: { userId: number }) => {
  const [weeklyData, setWeeklyData] = useState<{ date: string; totalCalories: number }[]>([]);

  useEffect(() => {
    axios
      .get(`http://192.168.8.228:5000/food/weekly-intake/${userId}`)
      .then((res) => {
        const safeData = (res.data || []).filter(
          (item: any) =>
            typeof item.totalCalories === 'number' &&
            isFinite(item.totalCalories) &&
            typeof item.date === 'string'
        );
        setWeeklyData(safeData);
      })
      .catch((err) => {
        console.error('WeeklyGraph API error:', err);
        setWeeklyData([]);
      });
  }, [userId]);

  const labels = weeklyData.map((item) => item.date.slice(5)); // MM-DD
  const data = weeklyData.map((item) => item.totalCalories);

  return (
    <View>
      <Text style={{ textAlign: 'center', marginBottom: 10 }}>Weekly Calorie Intake</Text>
      <BarChart
        data={{
          labels: labels.length > 0 ? labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{ data: data.length > 0 ? data : Array(7).fill(0) }],
        }}
        width={screenWidth - 30}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" cal"
        chartConfig={{
          backgroundColor: '#1e1e1e',
          backgroundGradientFrom: '#2e2e2e',
          backgroundGradientTo: '#3e3e3e',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
          labelColor: () => '#fff',
        }}
        style={{ borderRadius: 16 }}
      />
    </View>
  );
};

export default WeeklyGraph;

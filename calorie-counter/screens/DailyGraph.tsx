import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

const DailyGraph = ({ userId }: { userId: number }) => {
  const [hourlyData, setHourlyData] = useState<number[]>(Array(24).fill(0));

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    axios
      .get(`http://192.168.8.228:5000/food/user/${userId}/date/${today}`)
      .then((res) => {
        let data = res.data;

    
        if (!Array.isArray(data) || data.length !== 24) {
          data = Array(24).fill(0);
        }

       
        const cleaned = data.map((val: any) => {
          const num = parseFloat(val);
          return isFinite(num) && !isNaN(num) ? num : 0;
        });

        setHourlyData(cleaned);
      })
      .catch((err) => {
        console.error('DailyGraph API error:', err);
        setHourlyData(Array(24).fill(0));
      });
  }, [userId]);

  return (
    <View>
      <Text style={{ textAlign: 'center', marginBottom: 10 }}>
        Today’s Calorie Intake (Hourly)
      </Text>
      <LineChart
        data={{
          labels: Array.from({ length: 24 }, (_, i) => (i % 3 === 0 ? `${i}` : '')),
          datasets: [{ data: hourlyData }],
        }}
        width={screenWidth - 30}
        height={220}
        yAxisSuffix=" cal"
        chartConfig={{
          backgroundColor: '#1e1e1e',
          backgroundGradientFrom: '#2e2e2e',
          backgroundGradientTo: '#3e3e3e',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 200, 255, ${opacity})`,
          labelColor: () => '#fff',
        }}
        style={{ borderRadius: 16 }}
      />
    </View>
  );
};

export default DailyGraph;

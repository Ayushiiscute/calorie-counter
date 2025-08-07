import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import ScreenWrapper from '../components/ScreenWrapper';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();

  const scale = useSharedValue(1);


  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <ScreenWrapper hideBox>
      <View style={styles.outerContainer}>
        <BlurView
          intensity={120}
          tint="dark"
          style={[styles.innerBox, { width: width * 0.95, maxWidth: 450 }]}
        >
          {/* Animated Flame Icon */}
          <Animated.View style={[styles.iconWrapper, animatedStyle]}>
            <Ionicons name="fitness" size={60} color="pink" />
          </Animated.View>

          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.subtitle}>Calorie Counter App</Text>

          <TouchableOpacity
            style={[styles.button, { marginTop: 50, marginBottom: 25 }]}
            onPress={() => navigation.navigate('Signup')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  innerBox: {
    borderRadius: 24,
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  iconWrapper: {
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 45,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    backgroundColor: 'rgba(30, 90, 180, 0.85)',
    paddingVertical: 18,
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  loginButton: {
    backgroundColor: 'rgba(30,90,180,0.85)',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
});

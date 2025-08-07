import React, { useState } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import ScreenWrapper from '../components/ScreenWrapper';
import { registerUser } from '../api';
import { Ionicons } from '@expo/vector-icons';
import { useCustomBackHandler } from '@/hooks/useCustomBackHandler';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const flameScale = useSharedValue(1);

  React.useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  useCustomBackHandler(navigation);

  const onSignup = async () => {
    if (!email || !password || !calories) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({ type: 'error', text1: 'Invalid email format' });
      return;
    }

    const calorieValue = parseInt(calories);
    if (isNaN(calorieValue) || calorieValue <= 0) {
      Toast.show({ type: 'error', text1: 'Enter a valid calorie goal' });
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(email, password, calorieValue);

      Toast.show({ type: 'success', text1: 'Account created successfully' });

      navigation.navigate('Home', {
        calories: calorieValue,
        userId: user.id,
      });
    } catch (error: any) {
      if (error.response?.status === 409) {
        Toast.show({
          type: 'error',
          text1: 'Email already registered',
          text2: 'Please log in or use a different email',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Signup failed',
          text2: 'Try again later',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper hideBox={true}>
      <BlurView intensity={100} tint="dark" style={styles.signupBox}>
        <Animated.View style={[styles.iconWrapper, animatedFlameStyle]}>
          <Ionicons name="fitness" size={52} color="pink" />
        </Animated.View>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#bbb"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            autoComplete="password"
            textContentType="password"
          />
          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            style={styles.eyeIcon}
            activeOpacity={0.7}
          >
            <Ionicons name={secureText ? 'eye-off' : 'eye'} size={24} color="white" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Daily Calorie Goal"
          placeholderTextColor="#bbb"
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          returnKeyType="done"
        />

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={loading}
          onPress={onSignup}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            start={[0, 0]}
            end={[1, 0]}
            style={[styles.button, loading && { opacity: 0.6 }]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.helperText}>
          Already have an account?{' '}
          <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
            Log in
          </Text>
        </Text>
      </BlurView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  signupBox: {
    width: '85%',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(24, 2, 2, 0.18)',
    overflow: 'hidden',
    shadowColor: 'transparent',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.7,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    borderWidth: 0,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 28,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 16,
    color: 'white',
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  buttonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 28,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 80, 160, 0.75)',
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 1,
  },
  helperText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 15,
  },
  linkText: {
    color: '#90caf9',
    fontWeight: '700',
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
});

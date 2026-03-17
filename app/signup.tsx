import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, StatusBar, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '@/services/auth';
import { useAlert } from '@/template';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';

export default function SignupScreen() {
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showAlert('Missing Information', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      showAlert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await authService.signUp(email, password, fullName);
      showAlert('Success', 'Account created successfully! Please check your email to verify your account.');
      router.replace('/login');
    } catch (error: any) {
      showAlert('Signup Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <KeyboardAvoidingView 
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.illustrationContainer}>
              <LinearGradient
                colors={[colors.primary + '40', colors.primaryDark + '20']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.illustrationBg}
              >
                <MaterialIcons name="lock-open" size={64} color={colors.primary} />
              </LinearGradient>
            </View>

            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Join The Vault</Text>
              <Text style={styles.heroSubtitle}>
                Create your account to access premium study materials
              </Text>
            </View>
          </View>

          {/* Signup Form */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.textTertiary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons 
                  name={showPassword ? 'visibility' : 'visibility-off'} 
                  size={20} 
                  color={colors.textTertiary} 
                />
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons 
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                  size={20} 
                  color={colors.textTertiary} 
                />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.signupButtonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Already have an account?</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  heroSection: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: spacing.lg,
  },
  illustrationBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
    paddingHorizontal: spacing.lg,
  },
  formSection: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  signupButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradientButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  secondaryButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  footer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.xs * 1.5,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { user, loading, sessionConflict } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // All hooks called BEFORE any conditional returns
  const tabBarStyle = {
    height: Platform.select({
      ios: insets.bottom + 62,
      android: insets.bottom + 62,
      default: 70,
    }),
    paddingTop: 8,
    paddingBottom: Platform.select({
      ios: insets.bottom + 8,
      android: insets.bottom + 8,
      default: 8,
    }),
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  };

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (sessionConflict) return <Redirect href="/session-conflict" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Subjects',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? 'menu-book' : 'menu-book'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          title: 'Flashcards',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? 'style' : 'style'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? 'smart-toy' : 'smart-toy'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          title: 'Quizzes',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? 'quiz' : 'quiz'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
      {/* Hide old tabs from tab bar */}
      <Tabs.Screen name="inbox" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

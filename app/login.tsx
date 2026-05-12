/**
 * Login Screen — 登入頁面
 * 淺色主題，支援中英雙語
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { authApi } from '@/src/api/auth';
import { Colors, FontSize, Spacing, BorderRadius } from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth, serverUrl, setServerUrl } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [tempServerUrl, setTempServerUrl] = useState(serverUrl);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('提示', '請輸入帳號和密碼');
      return;
    }

    setIsLoading(true);
    try {
      // 先試連線
      const healthResult = await authApi.health();
      console.log('Backend health:', healthResult);

      // 正式登入
      const result = await authApi.login({
        username: username.trim(),
        password: password.trim(),
      });

      // 將後端回傳轉成 User 格式
      const user = {
        id: parseInt(result.user.id) || 0,
        username: result.user.username,
        display_name: result.user.employee_name || result.user.username,
        role: (result.roles?.[0]?.role_name) || 'production',
        roles: (result.roles || []).map((r) => r.role_name),
        permissions: (result.permissions || []).map((p) => p.permission_code),
        department: result.user.employee_id || '',
        employee_id: result.user.employee_id,
      };

      await setAuth(user, result.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      const message = err?.data?.detail || err?.message || '登入失敗，請檢查帳號密碼';
      Alert.alert('登入錯誤', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveServerUrl = () => {
    const url = tempServerUrl.replace(/\/+$/, '');
    setServerUrl(url);
    setShowServerConfig(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="cube-outline" size={56} color={Colors.primary} />
          </View>
          <Text style={styles.title}>LLM-Mobile</Text>
          <Text style={styles.subtitle}>工廠管理 • 桌機一體</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>帳號</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="請輸入帳號"
                placeholderTextColor={Colors.inputPlaceholder}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>密碼</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="請輸入密碼"
                placeholderTextColor={Colors.inputPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={Colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <Text style={styles.loginButtonText}>登入系統</Text>
            )}
          </TouchableOpacity>

          {/* Server Config Toggle */}
          <TouchableOpacity
            style={styles.serverConfigToggle}
            onPress={() => setShowServerConfig(!showServerConfig)}
          >
            <Ionicons name="server-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.serverConfigText}>伺服器設定</Text>
          </TouchableOpacity>

          {showServerConfig && (
            <View style={styles.serverConfigPanel}>
              <Text style={styles.serverConfigLabel}>伺服器網址</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={tempServerUrl}
                  onChangeText={setTempServerUrl}
                  placeholder="http://localhost:8000"
                  placeholderTextColor={Colors.inputPlaceholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveServerUrl}>
                <Text style={styles.saveButtonText}>儲存</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  form: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: FontSize.md,
    color: Colors.inputText,
  },
  eyeIcon: {
    padding: Spacing.sm,
  },
  loginButton: {
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  serverConfigToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  serverConfigText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  serverConfigPanel: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  serverConfigLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  saveButton: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  versionText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});

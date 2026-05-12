/**
 * Profile Screen — 個人設定
 * 顯示使用者資訊、伺服器設定、語言切換、登出
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '@/src/constants/theme';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppStore } from '@/src/stores/appStore';
import { setLanguage, t } from '@/src/i18n';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
}

function SettingRow({ icon, label, value, onPress, showArrow = true }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.6 : 1}>
      <Ionicons name={icon} size={20} color={Colors.textSecondary} style={styles.settingIcon} />
      <Text style={styles.settingLabel}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {showArrow && <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, serverUrl, setServerUrl } = useAuthStore();
  const { language, setLanguage: setAppLang } = useAppStore();
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [tempUrl, setTempUrl] = useState(serverUrl);

  const handleLogout = () => {
    Alert.alert(
      '登出確認',
      '確定要登出嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ],
    );
  };

  const handleSaveUrl = () => {
    setServerUrl(tempUrl);
    setShowServerConfig(false);
  };

  const handleToggleLanguage = () => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    setAppLang(newLang);
  };

  const roleLabels: Record<string, string> = {
    director: '廠長 / Factory Director',
    production: '生管 / Production Controller',
    warehouse: '倉庫 / Warehouse Keeper',
    purchasing: '採購 / Purchasing Agent',
    quality: '品管 / Quality Inspector',
    accounting: '會計 / Accountant',
    sales: '業務 / Sales Manager',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <StatusBar style="dark" />

      {/* 使用者資訊 */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={Colors.primary} />
        </View>
        <Text style={styles.displayName}>{user?.display_name || '使用者'}</Text>
        <Text style={styles.roleName}>
          {user?.role ? roleLabels[user.role] || user.role : ''}
        </Text>
      </View>

      {/* 帳號資訊 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>帳號資訊</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>使用者名稱</Text>
          <Text style={styles.infoValue}>{user?.username || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>員工編號</Text>
          <Text style={styles.infoValue}>{user?.employee_id || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>權限數</Text>
          <Text style={styles.infoValue}>{user?.permissions?.length || 0} 項</Text>
        </View>
      </View>

      {/* 伺服器設定 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>伺服器設定</Text>
        <SettingRow
          icon="server-outline"
          label="伺服器網址"
          value={serverUrl}
          onPress={() => {
            setTempUrl(serverUrl);
            setShowServerConfig(!showServerConfig);
          }}
        />
        {showServerConfig && (
          <View style={styles.serverConfigPanel}>
            <TextInput
              style={styles.serverInput}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="http://localhost:8000"
              placeholderTextColor={Colors.inputPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveUrl}>
              <Text style={styles.saveButtonText}>儲存</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 偏好設定 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>偏好設定</Text>

        <SettingRow
          icon="language-outline"
          label="語言 / Language"
          value={language === 'zh' ? '中文' : 'English'}
          onPress={handleToggleLanguage}
        />
        <SettingRow
          icon="moon-outline"
          label="深色模式"
          value="已關閉（強制淺色）"
          showArrow={false}
        />
      </View>

      {/* 關於 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>關於</Text>
        <SettingRow
          icon="information-circle-outline"
          label="版本"
          value="v1.0.0"
          showArrow={false}
        />
        <SettingRow
          icon="code-slash-outline"
          label="框架"
          value="React Native (Expo)"
          showArrow={false}
        />
      </View>

      {/* 登出 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>登出</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.card,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  displayName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  roleName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  infoLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  infoValue: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  settingIcon: {
    marginRight: Spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  settingValue: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  serverConfigPanel: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  serverInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.inputText,
    marginTop: Spacing.md,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  logoutText: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: '500',
    marginLeft: Spacing.sm,
  },
});

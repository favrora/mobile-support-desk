import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

type AvatarProps = {
  initials: string;
  size?: number;
};

export function Avatar({ initials, size = 40 }: AvatarProps) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: Math.max(11, size * 0.32) }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueSoft,
  },
  text: {
    color: colors.blue,
    fontWeight: '700',
  },
});

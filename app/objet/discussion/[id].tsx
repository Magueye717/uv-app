import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui';
import { lostCategory, lostQuickReplies, lostSafetyTip, type LostMessage } from '@/constants/data';
import { colors, radii } from '@/constants/theme';
import { useLost } from '@/context/LostContext';

const time = (at: number) => {
  const d = new Date(at);
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
};

// Private conversation about one item between its owner and the finder. No phone numbers.
export default function ObjetDiscussion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lost = useLost();
  const scroll = useRef<ScrollViewInstance>(null);
  const [text, setText] = useState('');

  const back = () => (router.canGoBack() ? router.back() : router.replace('/services/objets'));
  const item = lost.items.find((i) => i.id === id);
  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.head}>
          <BackButton onPress={back} />
        </View>
      </SafeAreaView>
    );
  }

  const other = item.mine ? 'l’autre étudiant' : item.by;
  const thread = lost.messages.filter((m) => m.itemId === item.id);
  const closed = !!item.returned;
  const cat = lostCategory(item.category);

  const send = (value: string) => {
    if (!value.trim() || closed) return;
    lost.send(item.id, value);
    setText('');
  };

  const report = (m: LostMessage) => {
    if (m.author !== 'them') return;
    Alert.alert(other, m.text, [
      {
        text: 'Signaler',
        onPress: () => Alert.alert('Message signalé', 'L’équipe va lire la conversation. Merci de garder le campus sûr.'),
      },
      { text: 'Fermer', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <BackButton onPress={back} />
        <Pressable style={styles.item} onPress={() => router.navigate(`/objet/${item.id}`)} accessibilityRole="button">
          <View style={[styles.thumb, { backgroundColor: item.bg }]}>
            {item.photo && item.kind === 'object' ? (
              <Image source={item.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <Ionicons name={cat.icon} size={18} color={item.tint} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Avec {other}
            </Text>
          </View>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scroll}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled">
          <View style={styles.safety}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.muted2} />
            <Text style={styles.safetyText}>{lostSafetyTip}</Text>
          </View>

          {thread.map((m) =>
            !m.author ? (
              <View key={m.id} style={styles.system}>
                <Text style={styles.systemText}>{m.text}</Text>
              </View>
            ) : (
              <Pressable
                key={m.id}
                onLongPress={() => report(m)}
                style={[styles.bubble, m.author === 'me' ? styles.mine : styles.theirs]}
                accessibilityHint={m.author === 'them' ? 'Appui long pour signaler' : undefined}>
                <Text style={[styles.text, m.author === 'me' && { color: '#fff' }]}>{m.text}</Text>
                <Text style={[styles.time, m.author === 'me' && { color: 'rgba(255,255,255,0.75)' }]}>{time(m.at)}</Text>
              </Pressable>
            ),
          )}
        </ScrollView>

        {closed ? (
          <View style={styles.closed}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.closedText}>Objet rendu · discussion fermée</Text>
          </View>
        ) : (
          <View style={styles.composer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quick} keyboardShouldPersistTaps="handled">
              {lostQuickReplies.map((q) => (
                <Pressable key={q} style={styles.quickChip} onPress={() => send(q)} accessibilityRole="button">
                  <Text style={styles.quickText}>{q}</Text>
                </Pressable>
              ))}
              <Pressable
                style={[styles.quickChip, styles.doneChip]}
                onPress={() =>
                  Alert.alert('Objet rendu ?', 'La discussion sera fermée.', [
                    { text: 'Pas encore', style: 'cancel' },
                    { text: 'Oui, c’est réglé', onPress: () => lost.markReturned(item.id) },
                  ])
                }
                accessibilityRole="button">
                <Ionicons name="checkmark-done" size={14} color={colors.successText} />
                <Text style={[styles.quickText, { color: colors.successText }]}>Objet rendu</Text>
              </Pressable>
            </ScrollView>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Message"
                placeholderTextColor={colors.muted}
                value={text}
                onChangeText={setText}
                multiline
                maxLength={300}
                accessibilityLabel="Écrire un message"
              />
              <Pressable
                style={[styles.send, !text.trim() && { opacity: 0.4 }]}
                disabled={!text.trim()}
                onPress={() => send(text)}
                accessibilityRole="button"
                accessibilityLabel="Envoyer">
                <Ionicons name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  item: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumb: { width: 40, height: 40, borderRadius: radii.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: colors.navy },
  subtitle: { fontSize: 12, color: colors.muted2, marginTop: 1 },
  thread: { padding: 16, gap: 8 },
  safety: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.md, backgroundColor: colors.card, marginBottom: 6 },
  safetyText: { fontSize: 11, color: colors.muted2, flexShrink: 1 },
  system: { alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, backgroundColor: '#E2E7F2' },
  systemText: { fontSize: 12, fontWeight: '600', color: colors.muted2, textAlign: 'center' },
  bubble: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.md },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.card, borderBottomLeftRadius: 4 },
  text: { fontSize: 14, color: colors.text, lineHeight: 19 },
  time: { fontSize: 10, color: colors.muted2, alignSelf: 'flex-end', marginTop: 2 },
  closed: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 16 },
  closedText: { fontSize: 13, fontWeight: '600', color: colors.successText },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.card, paddingVertical: 8, gap: 8 },
  quick: { gap: 8, paddingHorizontal: 12 },
  quickChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, height: 40, borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  doneChip: { backgroundColor: colors.successBg },
  quickText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12 },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 11,
    borderRadius: radii.lg,
    backgroundColor: colors.input,
    fontSize: 15,
    color: colors.text,
  },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});

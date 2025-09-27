import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type FeedbackModalProps = {
  message: string;
  onClose: () => void;
  duration?: number;
};

export default function FeedbackModal({ message, onClose, duration = 2500 }: FeedbackModalProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose, message]);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.card} pointerEvents="box-none">
          <Text style={styles.text}>{message}</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#F5FFE9',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 15,
    color: '#215A13',
    textAlign: 'center',
    lineHeight: 22,
  },
});

import { StyleSheet } from 'react-native';

const profileStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FDF9',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#0F2E04',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#111111',
  },
  cardDescription: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1A770A',
    paddingVertical: 12,
    borderRadius: 22,
  },
  actionButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },

});

export default profileStyles;

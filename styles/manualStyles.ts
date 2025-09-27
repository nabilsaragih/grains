import { StyleSheet } from 'react-native';

const manualStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradient: {
    flex: 1,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    minHeight: 88,
  },
  headerActionPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  title: {
    flex: 1,
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    lineHeight: 26,
    color: '#0F2E04',
    textAlign: 'center',
  },
  ocrShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#E9F6E9',
    borderWidth: 1,
    borderColor: '#C9E3C9',
    flexShrink: 0,
  },
  ocrShortcutText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    color: '#1A770A',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F5F7F4',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D6E4D6',
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#111111',
    paddingVertical: 0,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#1A770A',
  },
  searchButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7CED4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7F4',
  },
  statusBadgeActive: {
    backgroundColor: '#1A770A',
    borderColor: '#1A770A',
  },
  infoContent: {
    flex: 1,
    gap: 8,
  },
  infoLabel: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    color: '#111111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D6E4D6',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#111111',
    backgroundColor: '#FAFCF8',
  },
  portionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  portionInput: {
    flex: 1,
  },
  unitChip: {
    minWidth: 56,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#1A770A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitChipText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  sectionHeading: {
    marginTop: 32,
    marginBottom: 12,
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#0F2E04',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F1E6',
    paddingBottom: 10,
  },
  tableRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  tableCell: {
    flex: 1,
  },
  rowAction: {
    padding: 8,
  },
  addButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1A770A',
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: '#4B5563',
  },
  navActive: {
    color: '#1A770A',
    fontFamily: 'Montserrat-Bold',
  },

});

export default manualStyles;















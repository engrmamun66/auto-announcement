// Card designs for the Realtime Attendance page (RealtimeAttendences.vue).
// The choice is stored in settings.attendance.selected_realtime_cart and picked in ConfigSettings.vue.

export const DEFAULT_REALTIME_CARD = 1

export const REALTIME_CARD_DESIGNS = [
  { id: 1, name: 'Default', description: 'Full-colour card with the status as the background' },
  { id: 2, name: 'Card: Face Focus', description: 'Photo fills the card; details slide up on hover' },
  { id: 3, name: 'Card: Standard', description: 'Clean white card with the time as the headline' },
]

export function getSelectedRealtimeCard(attendanceSettings) {
  const id = Number(attendanceSettings?.selected_realtime_cart)
  return REALTIME_CARD_DESIGNS.some(d => d.id === id) ? id : DEFAULT_REALTIME_CARD
}

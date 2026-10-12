// Card designs for the dashboard Punch Board (home.vue). Design 1 is the original markup in home.vue;
// designs 2-4 are rendered by components/PunchCard.vue.
// The choice is stored in settings.selected_punch_card and picked in ConfigSettings.vue.

export const DEFAULT_PUNCH_CARD = 1

export const PUNCH_CARD_DESIGNS = [
  { id: 1, name: 'Default', description: 'The original punch board card' },
  { id: 2, name: 'Card: Ticket', description: 'Boarding-pass style with a coloured ID stub' },
  { id: 3, name: 'Card: Neon Glow', description: 'Glossy dark card; the calling card gets an animated neon border' },
  { id: 4, name: 'Card: Compact Row', description: 'Slim full-width rows to fit a long queue' },
]

export function getSelectedPunchCard(settings) {
  const id = Number(settings?.selected_punch_card)
  return PUNCH_CARD_DESIGNS.some(d => d.id === id) ? id : DEFAULT_PUNCH_CARD
}

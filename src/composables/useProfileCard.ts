interface BewlyProfileCardProvider {
  open: (mid: number, target: HTMLElement) => void
  close: () => void
}

export function useProfileCard(): BewlyProfileCardProvider {
  return inject('BEWLY_USER_PROFILE')!
}

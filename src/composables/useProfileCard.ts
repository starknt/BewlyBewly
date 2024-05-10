interface BewlyProfileCardProvider {
  open: (mid: number, t: HTMLElement) => void
  close: (rid?: number) => void
}

export function useProfileCard(): BewlyProfileCardProvider {
  return inject('BEWLY_USER_PROFILE')!
}

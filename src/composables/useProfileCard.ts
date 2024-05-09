interface BewlyProfileCardProvider {
  hasCacheUserProfile: (mid: number) => boolean
  openUserProfile: (mid: number, e: MouseEvent, rid: number) => void
  closeUserProfile: (rid?: number) => void
}

export function useProfileCard(): BewlyProfileCardProvider {
  return inject('BEWLY_USER_PROFILE')!
}

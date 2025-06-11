import { create } from 'zustand'

type NicknameState = {
  nickname: string
  setNickname: (name: string) => void
  clearNickname: () => void
}

export const useNicknameStore = create<NicknameState>((set) => ({
  nickname: '',
  setNickname: (name) => set({ nickname: name }),
  clearNickname: () => set({ nickname: '' }),
}))

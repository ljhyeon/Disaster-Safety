// store/useShelterStore.js
import { create } from 'zustand'

export const useShelterStore = create((set) => ({
    selectedId: null,
    name: '',

    setSelectedId: (id) => set({ selectedId: id }),
    setName: (name) => set({name: name}),
}))

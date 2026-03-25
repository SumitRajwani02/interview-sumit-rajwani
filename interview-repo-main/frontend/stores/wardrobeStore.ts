import { create } from 'zustand';
import { ClothingItem, AddItemRequest } from '../types';
import { wardrobeAPI } from '../services/api/wardrobe';
import { friendlyError } from '../utils/friendlyError';

//  Define the allowed sort modes
export type SortMode = 'newest' | 'oldest' | 'name';

interface WardrobeState {
  items: ClothingItem[];
  categories: Record<string, number>;
  selectedCategory: string;
  sortMode: SortMode; //  Added sortMode
  isLoading: boolean;
  error: string | null;

  fetchItems: (category?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  addItem: (req: AddItemRequest) => Promise<ClothingItem>;
  deleteItem: (id: string) => Promise<void>;
  
  setCategory: (category: string) => void;
  setSortMode: (mode: SortMode) => void; //  Added action signature
  clearError: () => void;
}

//  Helper function to handle the actual sorting logic cleanly
const sortClothingItems = (items: ClothingItem[], mode: SortMode): ClothingItem[] => {
  return [...items].sort((a, b) => {
    switch (mode) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
};

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  categories: {},
  selectedCategory: '',
  sortMode: 'newest', //  Default sort mode
  isLoading: false,
  error: null,

  fetchItems: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const fetchedItems = await wardrobeAPI.listItems(category || get().selectedCategory || undefined);
      //  Apply the active sort mode before saving to state
      const sortedItems = sortClothingItems(fetchedItems, get().sortMode);
      set({ items: sortedItems, isLoading: false });
    } catch (e: unknown) {
      set({ isLoading: false, error: friendlyError(e, 'Couldn\'t load your wardrobe. Please try again.') });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await wardrobeAPI.getCategories();
      set({ categories });
    } catch (e: unknown) {
      set({ error: friendlyError(e, 'Couldn\'t load categories. Please try again.') });
    }
  },

  addItem: async (req) => {
    set({ error: null });
    
    //  ADDED: try/catch block for error handling
    // Without this fix: Unhandled network errors would cause silent UI failures,
    // leaving the user stuck without knowing why their item wasn't saved.
    try {
      const item = await wardrobeAPI.addItem(req);
      
      set((state) => {
        const updatedItems = [item, ...state.items];
        //  Re-sort the whole array so the new item appears in the right spot
        return { items: sortClothingItems(updatedItems, state.sortMode) };
      });
      
      return item;
    } catch (e: unknown) {
      //  ADDED: Surface the error to the state so the UI can show a message
      set({ error: friendlyError(e, 'Couldn\'t add item. Please try again.') });
      // Rethrow so the calling component (e.g., a "Save" button) knows to stop spinning
      throw e; 
    }
  },

  deleteItem: async (id) => {
    set({ error: null });
    
    //  ADDED: try/catch block for error handling
    // Without this fix: Deletion failures would fail silently, making the user
    // think the item was deleted when it actually still exists in the database.
    try {
      await wardrobeAPI.deleteItem(id);
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    } catch (e: unknown) {
      //  ADDED: Surface the error to the state
      set({ error: friendlyError(e, 'Couldn\'t delete item. Please try again.') });
      throw e;
    }
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().fetchItems(category);
  },

  // Implement the new action to update the mode and re-sort existing items instantly
  setSortMode: (mode) => {
    set((state) => ({
      sortMode: mode,
      items: sortClothingItems(state.items, mode)
    }));
  },

  clearError: () => set({ error: null }),
}));
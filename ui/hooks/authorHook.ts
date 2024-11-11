import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthorState {
  name: string;
  email: string;
  id: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setId: (id: string) => void;
  setAuthor: (author: { name: string; email: string; id: string }) => void;
  clear: () => void;
}

const useAuthorStore = create(
  persist<AuthorState>(
    (set, get) => ({
      name: "",
      email: "",
      id: "",
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      setId: (id) => set({ id }),
      setAuthor: (author) =>
        set({ name: author.name, email: author.email, id: author.id }),

      clear: () => set({ name: "", email: "", id: "" }),
    }),
    {
      name: "author-storage", // unique name for the storage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthorStore;

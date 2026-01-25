import { configureStore } from '@reduxjs/toolkit';

// Reducer minimal pour éviter l'erreur "Store does not have a valid reducer"
// TODO: Ajouter les vrais reducers quand nécessaire
const dummyReducer = (state = {}) => state;

export const store = configureStore({
  reducer: {
    app: dummyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

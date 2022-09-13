import {configureStore} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistStore, persistReducer} from 'redux-persist';
import {RootReducer} from './reducer';
const create_Logger = require('redux-logger');
const logger = create_Logger.createLogger();

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['permissionReducer'],
};
const persistedReducer = persistReducer(persistConfig, RootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(logger),
});
export const persistor = persistStore(store);

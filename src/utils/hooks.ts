import { useDispatch as useReduxDispatch, useSelector as useReduxSelector, TypedUseSelectorHook } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootState, AppDispatch } from '../store';

export const useDispatch = () => useReduxDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
export const useSafeArea = useSafeAreaInsets;

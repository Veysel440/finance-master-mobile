import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';


const back = jest.fn();
jest.mock('expo-router', () => ({

    router: { back, push: jest.fn(), replace: jest.fn() },
    useLocalSearchParams: () => ({ id: 1 }),
    Stack: () => null,
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(async () => null),
    setItemAsync: jest.fn(async () => undefined),
    deleteItemAsync: jest.fn(async () => undefined),
}));
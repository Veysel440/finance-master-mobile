import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';
import "whatwg-fetch";
import "@testing-library/jest-native/extend-expect";
import { server } from "@/test/msw/server";


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

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

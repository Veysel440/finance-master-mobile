import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TxDetail from 'app/transactions/[id]';


const mutateAsync = jest.fn();

jest.mock('@/features/transactions/service', () => ({
    useTxOne: () => ({
        data: {
            id: 1,
            type: 'expense',
            amount: 50,
            currency: 'TRY',
            note: 'n',
            walletId: 10,
            categoryId: 20,
            occurredAt: new Date(2024, 0, 2, 10, 0).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        isLoading: false,
        isError: false,
    }),
    useUpdateTx: () => ({ mutateAsync }),
    useDeleteTx: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('@/features/catalog/service', () => ({
    useWallets: () => ({ data: [{ id: 10, name: 'Cüzdan', currency: 'TRY' }] }),
    useCategories: () => ({ data: [{ id: 20, name: 'Yemek' }] }),
}));

function renderWithClient(ui: React.ReactElement) {
    const qc = new QueryClient();
    return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

test('Kaydet yerel tarih/saatten occurredAt gönderir', async () => {
    renderWithClient(<TxDetail />);

    const button = await screen.findByText('Kaydet');
    fireEvent.press(button);

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());

    const arg = (mutateAsync as jest.Mock).mock.calls[0][0];
    expect(arg).toHaveProperty('payload.occurredAt');
    expect(typeof arg.payload.occurredAt).toBe('string');
    expect(arg.payload).toMatchObject({ currency: 'TRY', walletId: 10, categoryId: 20 });
});
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, router } from 'expo-router';

import Screen from '@/components/ui/Screen';
import { buildLocalDateTimeISO } from '@/utils/datetime';
import { useUpdateTx, /* testlerde mocklanıyor */ useTxOne } from '@/features/transactions/service';
import { useWallets, useCategories } from '@/features/catalog/service';

export default function TxDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const txId = useMemo(() => Number(id), [id]);

    const { data: tx, isLoading } = useTxOne(txId);
    const update = useUpdateTx();

    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState<string>('0');
    const [currency, setCurrency] = useState<string>('TRY');
    const [note, setNote] = useState<string>('');
    const [walletId, setWalletId] = useState<number | undefined>();
    const [categoryId, setCategoryId] = useState<number | undefined>();

    const [datePart, setDatePart] = useState<Date>(new Date());
    const [timePart, setTimePart] = useState<Date>(new Date());

    const { data: wallets } = useWallets();
    const { data: cats } = useCategories(type);

    useEffect(() => {
        if (!tx) return;
        setType(tx.type);
        setAmount(String(tx.amount));
        setCurrency(tx.currency);
        setNote(tx.note ?? '');
        setWalletId(tx.walletId);
        setCategoryId(tx.categoryId);

        const occ = new Date(tx.occurredAt);
        setDatePart(new Date(occ.getFullYear(), occ.getMonth(), occ.getDate()));
        setTimePart(new Date(1970, 0, 1, occ.getHours(), occ.getMinutes(), occ.getSeconds()));
    }, [tx]);

    const onSave = async () => {
        if (!walletId || !categoryId) {
            Alert.alert('Uyarı', 'Cüzdan ve kategori seçmelisin');
            return;
        }

        const occurredAt = buildLocalDateTimeISO(datePart, timePart);

        await update.mutateAsync({
            id: txId,
            payload: {
                type,
                amount: Number(amount),
                currency,
                note: note || null,
                walletId,
                categoryId,
                occurredAt,
            },
        });

        router.back();
    };

    if (isLoading || !tx) {
        return (
            <Screen>
                <ActivityIndicator />
            </Screen>
        );
    }

    return (
        <Screen>
            <View style={{ padding: 16, gap: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '600' }}>Hareket Düzenle</Text>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                        onPress={() => setType('expense')}
                        style={{
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            backgroundColor: type === 'expense' ? '#000' : '#e5e7eb',
                        }}
                    >
                        <Text style={{ color: type === 'expense' ? '#fff' : '#000' }}>Gider</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setType('income')}
                        style={{
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            backgroundColor: type === 'income' ? '#000' : '#e5e7eb',
                        }}
                    >
                        <Text style={{ color: type === 'income' ? '#fff' : '#000' }}>Gelir</Text>
                    </Pressable>
                </View>

                <TextInput
                    placeholder="Tutar"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 8 }}
                />

                <TextInput
                    placeholder="Para birimi"
                    value={currency}
                    onChangeText={setCurrency}
                    autoCapitalize="characters"
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 8 }}
                />

                <TextInput
                    placeholder="Not"
                    value={note}
                    onChangeText={setNote}
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 8 }}
                />

                <Text style={{ marginTop: 8 }}>Cüzdan</Text>
                <Picker selectedValue={walletId} onValueChange={(v) => setWalletId(v)}>
                    <Picker.Item label="Seç" value={undefined} />
                    {(wallets ?? []).map((w) => (
                        <Picker.Item key={w.id} label={`${w.name} (${w.currency})`} value={w.id} />
                    ))}
                </Picker>

                <Text style={{ marginTop: 8 }}>Kategori</Text>
                <Picker selectedValue={categoryId} onValueChange={(v) => setCategoryId(v)}>
                    <Picker.Item label="Seç" value={undefined} />
                    {(cats ?? []).map((c) => (
                        <Picker.Item key={c.id} label={c.name} value={c.id} />
                    ))}
                </Picker>

                <Pressable
                    onPress={onSave}
                    style={{
                        backgroundColor: '#000',
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginTop: 8,
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Kaydet</Text>
                </Pressable>
            </View>
        </Screen>
    );
}
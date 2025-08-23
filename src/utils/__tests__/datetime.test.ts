import { buildLocalDateTimeISO } from '@/utils/datetime';

test('buildLocalDateTimeISO yerel saatten doğru ISO üretir', () => {
    const d = new Date(2024, 0, 2);
    const t = new Date(2024, 0, 2, 14, 30);

    const iso = buildLocalDateTimeISO(d, t);

    expect(typeof iso).toBe('string');
    const asDate = new Date(iso);
    expect(asDate.toISOString()).toBe(iso);

    const local = new Date(iso);
    expect(local.getHours()).toBe(14);
    expect(local.getMinutes()).toBe(30);
});
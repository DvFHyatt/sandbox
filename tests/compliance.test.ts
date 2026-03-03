import { describe, it, expect } from 'vitest';
import { calculateTarget, ojtDistinctDays, isCompliant } from '../lib/compliance';

describe('compliance algorithm', () => {
  it('rounds up partial month target', () => {
    const target = calculateTarget(new Date('2025-03-01T00:00:00Z'), new Date('2025-03-15T00:00:00Z'));
    expect(target).toBe(10);
  });

  it('handles cross-month inclusive ranges', () => {
    const target = calculateTarget(new Date('2025-01-20T00:00:00Z'), new Date('2025-02-10T00:00:00Z'));
    expect(target).toBe(15);
  });

  it('counts same-day multiple OJT as one day', () => {
    expect(ojtDistinctDays(['2025-03-05', '2025-03-05', '2025-03-06'])).toBe(2);
  });

  it('determines compliance correctly', () => {
    const ok = isCompliant(Array.from({ length: 20 }, (_, i) => `2025-03-${String(i + 1).padStart(2, '0')}`), new Date('2025-03-01T00:00:00Z'), new Date('2025-03-31T00:00:00Z'));
    expect(ok).toBe(true);
  });

  it('flags non compliance when below target', () => {
    const ok = isCompliant(['2025-03-01', '2025-03-02'], new Date('2025-03-01T00:00:00Z'), new Date('2025-03-31T00:00:00Z'));
    expect(ok).toBe(false);
  });
});

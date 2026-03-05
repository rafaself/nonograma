import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges and resolves tailwind classes', () => {
    expect(cn('p-2', 'p-4', false && 'hidden', ['text-sm', undefined])).toBe('p-4 text-sm');
  });
});

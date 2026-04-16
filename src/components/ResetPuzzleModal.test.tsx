import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResetPuzzleModal } from './ResetPuzzleModal';

describe('ResetPuzzleModal', () => {
  it('renders and cancels without confirming', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(<ResetPuzzleModal onCancel={onCancel} onConfirm={onConfirm} />);

    expect(screen.getByRole('dialog', { name: 'Reset current trail?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Keep Solving' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms resetting the current puzzle', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(<ResetPuzzleModal onCancel={onCancel} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reset Puzzle' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });
});

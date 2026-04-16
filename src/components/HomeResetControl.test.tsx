import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeResetControl } from './HomeResetControl';

describe('HomeResetControl', () => {
  it('renders a disabled minimalist trigger when reset is unavailable', () => {
    render(
      <HomeResetControl
        canResetAllProgress={false}
        onResetAllProgress={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'Reset all progress' })).toBeDisabled();
    expect(screen.queryByRole('dialog', { name: 'Reset all progress?' })).not.toBeInTheDocument();
  });

  it('opens and cancels the reset progress modal', () => {
    const onResetAllProgress = vi.fn();

    render(
      <HomeResetControl
        canResetAllProgress={true}
        onResetAllProgress={onResetAllProgress}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset all progress' }));
    expect(screen.getByRole('dialog', { name: 'Reset all progress?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Keep Progress' }));

    expect(onResetAllProgress).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Reset all progress?' })).not.toBeInTheDocument();
  });

  it('confirms resetting all progress from the modal', () => {
    const onResetAllProgress = vi.fn();

    render(
      <HomeResetControl
        canResetAllProgress={true}
        onResetAllProgress={onResetAllProgress}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset all progress' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset Everything' }));

    expect(onResetAllProgress).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog', { name: 'Reset all progress?' })).not.toBeInTheDocument();
  });
});

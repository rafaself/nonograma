import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlayStatusHud } from './PlayStatusHud';

describe('PlayStatusHud', () => {
  it('renders puzzle metadata and formatted elapsed time', () => {
    render(
      <PlayStatusHud
        title="Temple Path"
        width={15}
        height={15}
        elapsedTime={3671}
      />,
    );

    expect(screen.getByRole('region', { name: 'Puzzle status' })).toBeInTheDocument();
    expect(screen.getByText('Temple Path')).toBeInTheDocument();
    expect(screen.getByText('15x15')).toBeInTheDocument();
    expect(screen.getByText('1:01:11')).toBeInTheDocument();
  });
});

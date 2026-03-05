import { describe, expect, it, vi } from 'vitest';

const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({ render: renderMock }));

vi.mock('react-dom/client', () => ({
  createRoot: createRootMock,
}));

vi.mock('./App.tsx', () => ({
  default: () => null,
}));

describe('main entry', () => {
  it('mounts app into root element', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await import('./main');

    const root = document.getElementById('root');
    expect(createRootMock).toHaveBeenCalledWith(root);
    expect(renderMock).toHaveBeenCalledTimes(1);
  });
});

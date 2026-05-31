import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App', () => {
  it('renders a 10x10 Akari grid', () => {
    render(<App />);

    const board = screen.getByRole('grid', { name: 'Akari board' });

    expect(board).toHaveAttribute('aria-colcount', '10');
    expect(board).toHaveAttribute('aria-rowcount', '10');
    expect(screen.getAllByRole('gridcell')).toHaveLength(100);
    expect(screen.getByRole('gridcell', { name: 'Row 1, column 1' })).toBeInTheDocument();
  });

  it('allows cells to receive hover interactions', async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstCell = screen.getByRole('gridcell', { name: 'Row 1, column 1' });

    await user.hover(firstCell);

    expect(firstCell).toBeInTheDocument();
  });
});

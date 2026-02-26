import { render, screen } from '@testing-library/react';

describe('App shell', () => {
  it('renders placeholder title', () => {
    render(<div>HalfMovies</div>);
    expect(screen.getByText('HalfMovies')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders RAMS Generator heading', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /RAMS Generator/i });
  expect(heading).toBeInTheDocument();
});

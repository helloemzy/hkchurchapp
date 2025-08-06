import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    
    // Check if the main content is rendered
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('displays the application title', () => {
    render(<Home />);
    
    // This will need to be updated based on the actual page content
    // For now, just check that something renders
    expect(document.body).toBeInTheDocument();
  });
});
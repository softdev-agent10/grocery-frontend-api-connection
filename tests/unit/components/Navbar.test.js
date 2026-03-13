// Setup the test environment for the Navbar component
import { render, screen } from '@testing-library/react';
import Navbar from '../../../components/Navbar';

describe('Navbar Component', () => {
  test('renders the Navbar component', () => {
    render(<Navbar />);
    
    // Check if the logo is rendered
    const logoElement = screen.getByAltText(/grocery logo/i);
    expect(logoElement).toBeInTheDocument();
    
    // Check if the navigation links are rendered
    const homeLink = screen.getByRole('link', { name: /home/i });
    const productsLink = screen.getByRole('link', { name: /products/i });
    const aboutLink = screen.getByRole('link', { name: /about/i });
    
    expect(homeLink).toBeInTheDocument();
    expect(productsLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
  });
});
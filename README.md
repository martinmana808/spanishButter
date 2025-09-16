# STIHL Shop Tauranga Website

A modern, responsive website for STIHL Shop Tauranga built with HTML, LESS, and JavaScript.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with STIHL's signature orange color scheme
- **Interactive Elements**: Accordion, carousel, smooth scrolling, and hover effects
- **Performance Optimized**: Fast loading with optimized images and code
- **Accessibility**: Built with accessibility best practices in mind

## Project Structure

```
www/
├── index.html              # Main HTML file
├── styles/
│   ├── main.less          # LESS source file
│   └── main.css           # Compiled CSS file
├── js/
│   └── main.js            # JavaScript functionality
└── README.md              # This file
```

## Sections

1. **Header**: Fixed navigation with logo and menu
2. **Hero**: Full-screen hero section with call-to-action buttons
3. **Products**: Grid of product cards with hover effects
4. **About**: Two-column layout with image and text
5. **Services**: Service offerings with icons
6. **Battery Technology**: Full-width image section
7. **Why Choose Us**: Accordion-style feature list
8. **Reviews**: Customer testimonials with carousel
9. **Latest Articles**: Blog posts in card format
10. **Call to Action**: Booking section with background image
11. **Footer**: Contact information and social links

## Technologies Used

- **HTML5**: Semantic markup
- **LESS**: CSS preprocessor for better styling
- **JavaScript (ES6+)**: Interactive functionality
- **CSS Grid & Flexbox**: Modern layout techniques
- **Google Fonts**: Inter font family

## Getting Started

### Prerequisites

- Node.js and npm (for LESS compilation)
- A modern web browser

### Installation

1. Clone or download the project files
2. Navigate to the project directory
3. Install LESS globally (if not already installed):
    ```bash
    npm install -g less
    ```

### Development

1. **Compile LESS to CSS**:

    ```bash
    lessc styles/main.less styles/main.css
    ```

2. **Open the website**:
    - Open `index.html` in your web browser
    - Or use a local server for better development experience

### Using a Local Server

For the best development experience, use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Customization

### Colors

The main colors are defined as LESS variables in `styles/main.less`:

```less
@primary-color: #ff6600; // STIHL Orange
@secondary-color: #333333; // Dark Gray
@white: #ffffff;
@black: #000000;
```

### Content

- Update text content in `index.html`
- Replace placeholder images with actual STIHL product images
- Modify contact information in the footer
- Update testimonials in `js/main.js`

### Styling

- Edit `styles/main.less` for styling changes
- Recompile with `lessc styles/main.less styles/main.css`
- The CSS file is automatically generated from the LESS source

## Interactive Features

### Accordion

- Click on accordion headers to expand/collapse content
- Only one item can be open at a time

### Testimonial Carousel

- Automatic rotation every 5 seconds
- Click dots to manually navigate
- Smooth transitions between testimonials

### Smooth Scrolling

- Navigation links smoothly scroll to sections
- Accounts for fixed header height

### Hover Effects

- Product and article cards lift on hover
- Buttons have hover states
- Social icons animate on hover

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Internet Explorer 11+

## Performance

- Optimized images with placeholder URLs (replace with actual images)
- Minified CSS and JavaScript for production
- Lazy loading support for images
- Efficient animations using CSS transforms

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- Screen reader friendly

## Future Enhancements

- Contact form functionality
- Product catalog integration
- Blog system
- Online booking system
- E-commerce integration
- SEO optimization
- Analytics integration

## License

This project is for demonstration purposes. STIHL is a registered trademark of STIHL Group.

## Support

For questions or support, please contact the development team.

---

**Note**: This is a static website template. For production use, consider:

- Adding a backend for dynamic content
- Implementing a CMS for easy content management
- Adding SSL certificate for security
- Setting up proper hosting and domain
- Implementing analytics and tracking

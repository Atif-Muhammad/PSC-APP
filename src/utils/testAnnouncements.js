/**
 * Test Data for Rich Text Announcements
 * 
 * Use this data to test the AnnouncementRenderer component
 * in development or staging environments.
 */

export const TEST_ANNOUNCEMENTS = [
  {
    id: 'test-1',
    title: 'Basic HTML Test',
    description: `
      <p>This is a <strong>basic</strong> paragraph with <em>italic</em> and <u>underline</u> text.</p>
      <p>Testing standard paragraph formatting with proper line height and spacing.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td1', seen: false }],
  },
  {
    id: 'test-2',
    title: 'Headings Test',
    description: `
      <h1>Heading 1 - Largest</h1>
      <h2>Heading 2 - Large</h2>
      <h3>Heading 3 - Medium</h3>
      <h4>Heading 4 - Small</h4>
      <p>Regular paragraph text below headings.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td2', seen: true }],
  },
  {
    id: 'test-3',
    title: 'Lists Test',
    description: `
      <h3>Unordered List:</h3>
      <ul>
        <li>Item one</li>
        <li>Item two</li>
        <li>Item three</li>
      </ul>
      
      <h3>Ordered List:</h3>
      <ol>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </ol>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td3', seen: false }],
  },
  {
    id: 'test-4',
    title: 'Links Test',
    description: `
      <p>Test different link types:</p>
      <ul>
        <li>Website: <a href="https://www.example.com">Visit Example</a></li>
        <li>Email: <a href="mailto:test@example.com">Send Email</a></li>
        <li>Phone: <a href="tel:+1234567890">Call Us</a></li>
      </ul>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td4', seen: false }],
  },
  {
    id: 'test-5',
    title: 'Blockquote Test',
    description: `
      <p>Introduction text before the quote.</p>
      <blockquote>
        This is a blockquote. It should have a left border and different background color.
      </blockquote>
      <blockquote>
        Another blockquote with <strong>bold</strong> and <em>italic</em> text inside.
      </blockquote>
      <p>Closing text after the quotes.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td5', seen: true }],
  },
  {
    id: 'test-6',
    title: 'Mixed Formatting Test',
    description: `
      <h2>Comprehensive Formatting Demo</h2>
      
      <p>This paragraph has <strong>bold</strong>, <em>italic</em>, <u>underline</u>, and <s>strikethrough</s> text all in one.</p>
      
      <h3>Nested Formatting:</h3>
      <p><strong>Bold with <em>italic inside</em></strong></p>
      <p><em>Italic with <strong>bold inside</strong></em></p>
      <p><u>Underline with <strong>bold</strong> and <em>italic</em></u></p>
      
      <blockquote>
        <strong>Important:</strong> This is a blockquote with multiple paragraphs inside.
        <p>Second paragraph within the same blockquote.</p>
      </blockquote>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td6', seen: false }],
  },
  {
    id: 'test-7',
    title: 'Long Content Performance Test',
    description: `
      <h1>Long Article Test</h1>
      
      <p>This is a very long article designed to test performance with extensive content. It should render smoothly even on older devices.</p>
      
      <h2>Section 1</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      
      <h2>Section 2</h2>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      
      <h3>Subsection 2.1</h3>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
      
      <h3>Subsection 2.2</h3>
      <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
      
      <h2>Section 3</h2>
      <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
      
      <blockquote>
        This is a very long blockquote that spans multiple sentences. It tests how the component handles large blocks of quoted content with proper formatting and spacing.
      </blockquote>
      
      <h2>Conclusion</h2>
      <p>This concludes our long content test. If you're seeing this, the renderer handled it successfully!</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td7', seen: false }],
  },
  {
    id: 'test-8',
    title: 'Special Characters Test',
    description: `
      <h2>Special Characters & Symbols</h2>
      <p>Testing special characters: &amp; © ® € £ ¥ ¢</p>
      <p>Mathematical symbols: ± × ÷ ≠ ≤ ≥ ∞</p>
      <p>Arrows: ← → ↑ ↓ ↔ ↕</p>
      <p>Shapes: ■ □ ▲ △ ● ○ ◆ ◇</p>
      <p>Currency: $100.50 | €50.25 | £75.00</p>
      <p>Percentages: 25% discount | 100% satisfaction guarantee</p>
      <p>Dates: March 4, 2026 | 04/03/2026 | Q1 2026</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td8', seen: true }],
  },
  {
    id: 'test-9',
    title: 'Empty/Minimal Test',
    description: '',
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td9', seen: false }],
  },
  {
    id: 'test-10',
    title: 'Plain Text Only (No Tags)',
    description: 'This is plain text without any HTML tags. It should still render properly as a simple paragraph.',
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td10', seen: false }],
  },
  {
    id: 'test-11',
    title: 'Security Test - Script Tags (Should Be Removed)',
    description: `
      <p>This announcement contains script tags that should be removed:</p>
      <script>alert('This should not execute!');</script>
      <p>Normal paragraph after script.</p>
      <iframe src="https://example.com"></iframe>
      <p>Another normal paragraph after iframe.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td11', seen: false }],
  },
  {
    id: 'test-12',
    title: 'Complex Layout Test',
    description: `
      <div style="text-align: center;">
        <h1 style="color: #A3834C;">Centered Heading with Custom Color</h1>
        <p style="font-style: italic;">Centered italic subtitle</p>
      </div>
      
      <hr />
      
      <div style="background-color: #F5F5F5; padding: 15px; border-radius: 8px;">
        <h3>Highlighted Section</h3>
        <p>This div has a background color and padding to simulate a card.</p>
        <ul>
          <li>Feature A</li>
          <li>Feature B</li>
          <li>Feature C</li>
        </ul>
      </div>
      
      <hr />
      
      <p style="text-align: right;"><em>Right-aligned italic text</em></p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'td12', seen: false }],
  },
];

// Helper function to get all test announcements
export const getAllTestAnnouncements = () => TEST_ANNOUNCEMENTS;

// Helper function to get a specific test by ID
export const getTestById = (id) => TEST_ANNOUNCEMENTS.find(a => a.id === id);

// Helper function to get only unseen test announcements
export const getUnseenTests = () => TEST_ANNOUNCEMENTS.filter(a => !a.deliveries[0].seen);

// Helper function to shuffle announcements for testing sort
export const getShuffledTests = () => {
  const shuffled = [...TEST_ANNOUNCEMENTS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default TEST_ANNOUNCEMENTS;

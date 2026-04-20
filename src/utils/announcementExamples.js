/**
 * Rich Text Announcement Examples
 * 
 * This file contains sample HTML content formats that can be used
 * to test or populate announcements in the app.
 */

export const ANNOUNCEMENT_EXAMPLES = {
  // 1. Simple Text Announcement
  simpleText: {
    id: 'example-1',
    title: 'General Notice',
    description: `
      <p>All members are reminded that the main clubhouse will be closed for routine maintenance this weekend.</p>
      <p>We apologize for any inconvenience and appreciate your understanding.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd1', seen: false }],
  },

  // 2. Formatted Announcement with Bold/Italic
  formattedText: {
    id: 'example-2',
    title: 'Dress Code Reminder',
    description: `
      <p><strong>Important Notice:</strong> All members must adhere to the club's dress code policy at all times.</p>
      <p>Smart casual attire is required in the dining areas. <em>Athletic wear is only permitted in sports facilities.</em></p>
      <p>Please note that <u>proper footwear</u> is mandatory in all indoor areas.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd2', seen: true }],
  },

  // 3. List-Based Announcement
  listContent: {
    id: 'example-3',
    title: 'Upcoming Events',
    description: `
      <h3>This Month's Activities:</h3>
      <ul>
        <li><strong>Tennis Tournament</strong> - Every Saturday</li>
        <li><strong>Swimming Classes</strong> - Mon, Wed, Fri (6 PM)</li>
        <li><strong>Yoga Sessions</strong> - Tue, Thu (7 AM)</li>
        <li><strong>Social Mixer</strong> - Last Sunday of the month</li>
      </ul>
      <p>For registration, please visit the front desk or call us.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd3', seen: false }],
  },

  // 4. Multi-Level Headings
  structuredContent: {
    id: 'example-4',
    title: 'New Facilities Guide',
    description: `
      <h1>Welcome to Our New Facilities</h1>
      
      <h2>Fitness Center</h2>
      <p>Our state-of-the-art fitness center includes:</p>
      <ul>
        <li>Cardio equipment</li>
        <li>Weight training area</li>
        <li>Personal training services</li>
      </ul>
      
      <h3>Operating Hours</h3>
      <p>Daily: 5:00 AM - 11:00 PM</p>
      
      <h2>Spa & Wellness</h2>
      <p>Relax and rejuvenate with our premium spa services including massages, facials, and body treatments.</p>
      
      <h3>Booking Required</h3>
      <p>All spa services require advance booking. Please call ext. 234.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd4', seen: false }],
  },

  // 5. With Links
  announcementWithLinks: {
    id: 'example-5',
    title: 'Member Portal Update',
    description: `
      <p>We've updated our member portal with new features!</p>
      <p>You can now:</p>
      <ol>
        <li>Book facilities online</li>
        <li>View your billing history</li>
        <li>Update your contact information</li>
      </ol>
      <p>Visit our <a href="https://portal.psc-club.com">Member Portal</a> to explore these features.</p>
      <p>For support, email us at <a href="mailto:support@psc-club.com">support@psc-club.com</a> or call <a href="tel:+1234567890">+1 234 567 890</a>.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd5', seen: true }],
  },

  // 6. Blockquote Highlight
  importantNotice: {
    id: 'example-6',
    title: 'Safety Guidelines',
    description: `
      <h2>Pool Safety Rules</h2>
      <p>All swimmers must follow these safety guidelines:</p>
      <blockquote>
        Children under 12 must be accompanied by an adult at all times.
      </blockquote>
      <blockquote>
        Running on pool deck is strictly prohibited.
      </blockquote>
      <p>These rules are in place to ensure everyone's safety and enjoyment.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd6', seen: false }],
  },

  // 7. Mixed Content (Advanced)
  advancedContent: {
    id: 'example-7',
    title: 'Annual General Meeting',
    description: `
      <h1 style="text-align: center;">📢 Annual General Meeting 2025</h1>
      
      <p style="text-align: center;"><em>"Building Our Community Together"</em></p>
      
      <hr />
      
      <h2>Event Details</h2>
      <ul>
        <li><strong>Date:</strong> March 15, 2025</li>
        <li><strong>Time:</strong> 2:00 PM - 5:00 PM</li>
        <li><strong>Venue:</strong> Grand Ballroom, Main Clubhouse</li>
      </ul>
      
      <h2>Agenda</h2>
      <ol>
        <li>Welcome Address by President</li>
        <li>Review of Annual Report</li>
        <li>Financial Statement Presentation</li>
        <li>Election of New Committee Members</li>
        <li>Q&A Session</li>
      </ol>
      
      <blockquote>
        <strong>Note:</strong> Light refreshments will be served following the meeting.
      </blockquote>
      
      <h3>RSVP Required</h3>
      <p>Please confirm your attendance by March 1st through the <a href="https://psc-club.com/agm-rsvp">online form</a> or at the front desk.</p>
      
      <p style="text-align: center;"><strong>Looking forward to seeing you there!</strong></p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd7', seen: false }],
  },

  // 8. Image-Heavy Announcement (with placeholder URLs)
  visualAnnouncement: {
    id: 'example-8',
    title: 'Renovation Complete!',
    description: `
      <h1>🎉 Tennis Courts Renovation Complete</h1>
      
      <p>We're excited to announce that all tennis courts have been fully renovated!</p>
      
      <img src="https://via.placeholder.com/600x400/A3834C/FFFFFF?text=Tennis+Court+1" alt="New Tennis Court Surface" />
      <p><em>New professional-grade surface coating</em></p>
      
      <img src="https://via.placeholder.com/600x400/A3834C/FFFFFF?text=Tennis+Court+2" alt="New Lighting System" />
      <p><em>LED lighting for night play</em></p>
      
      <h2>Features:</h2>
      <ul>
        <li>ITF-approved surface</li>
        <li>Enhanced drainage system</li>
        <li>Professional lighting</li>
        <li>New spectator seating</li>
      </ul>
      
      <blockquote>
        Book your court time now! Available for members daily from 6 AM to 10 PM.
      </blockquote>
      
      <p>Call <a href="tel:+1234567890">+1 234 567 890</a> to reserve your slot.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd8', seen: false }],
  },

  // 9. Code/Technical Information
  technicalUpdate: {
    id: 'example-9',
    title: 'App Update Instructions',
    description: `
      <h2>New Mobile App Features</h2>
      
      <p>To access the latest features, please update your app:</p>
      
      <h3>Steps to Update:</h3>
      <ol>
        <li>Open App Store (iOS) or Play Store (Android)</li>
        <li>Search for "PSC Club"</li>
        <li>Tap "Update"</li>
      </ol>
      
      <h3>New Features:</h3>
      <pre>
- Digital membership card
- Real-time booking status
- Push notifications for events
- Expense tracking for groups
      </pre>
      
      <p>Version: <code>2.5.0</code> | Build: <code>2025.03</code></p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd9', seen: true }],
  },

  // 10. Emergency/Urgent Notice
  urgentNotice: {
    id: 'example-10',
    title: '⚠️ Urgent: Water Shutdown',
    description: `
      <h1 style="color: #FF0000;">Emergency Maintenance Notice</h1>
      
      <p><strong>Water supply will be temporarily shut off tomorrow for emergency repairs.</strong></p>
      
      <h3>Shutdown Period:</h3>
      <p style="font-size: 18px;"><strong>March 5, 2025 | 10:00 PM - March 6, 2025 | 6:00 AM</strong></p>
      
      <blockquote>
        Affected areas: Main clubhouse, Gym, Swimming pool, Guest rooms
      </blockquote>
      
      <h3>Alternative Arrangements:</h3>
      <ul>
        <li>Portable water stations will be available at the parking lot</li>
        <li>Restroom facilities in the annex building will remain operational</li>
      </ul>
      
      <p>We apologize for the inconvenience. For emergencies, contact maintenance at <a href="tel:+1234567891">+1 234 567 891</a>.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd10', seen: false }],
  },

  // 11. Minimal/Plain Content
  plainText: {
    id: 'example-11',
    title: 'Quick Update',
    description: `
      <p>The lost and found box has been moved to the reception desk. Please check there if you've misplaced any items.</p>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd11', seen: false }],
  },

  // 12. Multilingual Support Example
  multilingual: {
    id: 'example-12',
    title: 'Welcome / خوش آمدید',
    description: `
      <h2>English</h2>
      <p>Welcome to our club! We're delighted to have you as a member.</p>
      
      <h2>Urdu</h2>
      <p>ہمارے کلب میں خوش آمدید! ہمیں خوشی ہے کہ آپ ہمارے رکن ہیں۔</p>
      
      <h2>Key Information / اہم معلومات</h2>
      <ul>
        <li>Opening hours: 6 AM - 11 PM</li>
        <li>Dress code: Smart casual</li>
        <li>Guest policy: Maximum 3 guests per member</li>
      </ul>
    `,
    createdAt: new Date().toISOString(),
    deliveries: [{ id: 'd12', seen: true }],
  },
};

// Export a function to get random example
export const getRandomExample = () => {
  const examples = Object.values(ANNOUNCEMENT_EXAMPLES);
  return examples[Math.floor(Math.random() * examples.length)];
};

// Export all keys for selection
export const getExampleKeys = () => Object.keys(ANNOUNCEMENT_EXAMPLES);

export default ANNOUNCEMENT_EXAMPLES;

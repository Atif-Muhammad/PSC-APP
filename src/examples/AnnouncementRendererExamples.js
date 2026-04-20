/**
 * AnnouncementRenderer Usage Examples
 * 
 * This file demonstrates various ways to use the AnnouncementRenderer
 * component throughout your React Native application.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import AnnouncementRenderer from '../components/AnnouncementRenderer';

// ============================================================================
// EXAMPLE 1: Basic Usage in Any Component
// ============================================================================

export const BasicUsageExample = () => {
  const htmlContent = `
    <h2>Welcome Message</h2>
    <p>This is a <strong>simple announcement</strong> with basic formatting.</p>
    <ul>
      <li>Feature 1</li>
      <li>Feature 2</li>
    </ul>
  `;

  return (
    <View style={styles.container}>
      <AnnouncementRenderer htmlContent={htmlContent} />
    </View>
  );
};

// ============================================================================
// EXAMPLE 2: In a Dashboard/Widget
// ============================================================================

export const DashboardWidgetExample = () => {
  const latestAnnouncement = {
    title: 'System Maintenance',
    content: `
      <p><strong>Scheduled maintenance</strong> on March 10th from 2-4 AM.</p>
      <p>Some services may be temporarily unavailable.</p>
    `,
  };

  return (
    <View style={styles.widgetCard}>
      <AnnouncementRenderer 
        htmlContent={latestAnnouncement.content}
        style={styles.widgetContent}
      />
    </View>
  );
};

// ============================================================================
// EXAMPLE 3: Scrollable Long Content
// ============================================================================

export const LongContentExample = () => {
  const longHtml = `
    <h1>Comprehensive Guide</h1>
    
    <h2>Chapter 1: Introduction</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    
    <h2>Chapter 2: Details</h2>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    
    <blockquote>Important note: Please read all sections carefully.</blockquote>
    
    <h2>Chapter 3: Conclusion</h2>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
  `;

  return (
    <ScrollView style={styles.scrollView}>
      <AnnouncementRenderer htmlContent={longHtml} />
    </ScrollView>
  );
};

// ============================================================================
// EXAMPLE 4: In a Modal/Popup
// ============================================================================

export const ModalContentExample = ({ visible, onClose }) => {
  const modalContent = `
    <h2 style="text-align: center;">🎉 Special Announcement</h2>
    <hr />
    <p>We're thrilled to announce our <strong>annual membership drive</strong>!</p>
    
    <h3>Benefits:</h3>
    <ul>
      <li>50% off on joining fee</li>
      <li>Free guest passes for 3 months</li>
      <li>Complimentary fitness assessment</li>
    </ul>
    
    <blockquote>Limited time offer. Valid until March 31st.</blockquote>
    
    <p>Contact us at <a href="tel:+1234567890">+1 234 567 890</a> for details.</p>
  `;

  return (
    // Wrap this in your Modal component
    <View style={styles.modalBody}>
      <AnnouncementRenderer htmlContent={modalContent} />
    </View>
  );
};

// ============================================================================
// EXAMPLE 5: Email-Style Announcement
// ============================================================================

export const EmailStyleExample = () => {
  const emailHtml = `
    <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px;">
      <h2 style="color: #A3834C;">Dear Member,</h2>
      
      <p>We hope this message finds you well.</p>
      
      <p>This is to inform you that your <strong>membership renewal</strong> is due on April 1st, 2025.</p>
      
      <h3>How to Renew:</h3>
      <ol>
        <li>Visit the member portal at <a href="https://portal.psc-club.com">portal.psc-club.com</a></li>
        <li>Login with your credentials</li>
        <li>Navigate to "My Membership"</li>
        <li>Click "Renew Now"</li>
      </ol>
      
      <blockquote>
        Early renewal before March 25th enters you into a draw to win a free weekend getaway!
      </blockquote>
      
      <p>Thank you for being a valued member.</p>
      
      <p><em>Best regards,<br/>The PSC Team</em></p>
    </div>
  `;

  return (
    <View style={styles.container}>
      <AnnouncementRenderer htmlContent={emailHtml} />
    </View>
  );
};

// ============================================================================
// EXAMPLE 6: Event Invitation
// ============================================================================

export const EventInvitationExample = () => {
  const eventHtml = `
    <h1 style="text-align: center; color: #A3834C;">🎭 Annual Gala Night</h1>
    
    <p style="text-align: center;"><em>You're cordially invited to the most anticipated event of the year!</em></p>
    
    <hr />
    
    <h2>Event Details</h2>
    <ul>
      <li><strong>Date:</strong> April 15, 2025</li>
      <li><strong>Time:</strong> 7:00 PM onwards</li>
      <li><strong>Venue:</strong> Grand Ballroom</li>
      <li><strong>Dress Code:</strong> Black Tie</li>
    </ul>
    
    <h2>Evening Highlights</h2>
    <ul>
      <li>Gourmet dinner by celebrity chef</li>
      <li>Live orchestra and performances</li>
      <li>Award ceremony</li>
      <li>Dance floor until midnight</li>
    </ul>
    
    <blockquote>
      RSVP by March 30th. Limited seats available.
    </blockquote>
    
    <p style="text-align: center;">
      <a href="https://psc-club.com/gala-rsvp" style="background-color: #A3834C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">RSVP Now</a>
    </p>
  `;

  return (
    <View style={styles.container}>
      <AnnouncementRenderer htmlContent={eventHtml} />
    </View>
  );
};

// ============================================================================
// EXAMPLE 7: Sports/Facility Update
// ============================================================================

export const FacilityUpdateExample = () => {
  const facilityHtml = `
    <h2>🏊 Swimming Pool Schedule Change</h2>
    
    <p>Dear Members,</p>
    
    <p>Please be advised that the swimming pool will operate on modified hours during the summer season:</p>
    
    <h3>Summer Hours (April - September)</h3>
    <ul>
      <li><strong>Weekdays:</strong> 6:00 AM - 10:00 PM</li>
      <li><strong>Weekends:</strong> 5:00 AM - 11:00 PM</li>
    </ul>
    
    <h3>Winter Hours (October - March)</h3>
    <ul>
      <li><strong>Daily:</strong> 7:00 AM - 9:00 PM</li>
    </ul>
    
    <blockquote>
      Lane swimming available: 6-8 AM and 8-10 PM daily.
    </blockquote>
    
    <p>For questions, contact the aquatics desk at <a href="tel:+1234567892">ext. 456</a>.</p>
  `;

  return (
    <View style={styles.container}>
      <AnnouncementRenderer htmlContent={facilityHtml} />
    </View>
  );
};

// ============================================================================
// EXAMPLE 8: Multiple Announcements in List
// ============================================================================

export const MultipleAnnouncementsExample = () => {
  const announcements = [
    {
      id: 1,
      content: '<p><strong>Reminder:</strong> Gym closed for maintenance on Sunday.</p>',
    },
    {
      id: 2,
      content: '<p>New yoga classes starting Monday. <a href="#">Register now</a>.</p>',
    },
    {
      id: 3,
      content: '<p>Cafeteria menu updated. Check out new healthy options!</p>',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {announcements.map((item) => (
        <View key={item.id} style={styles.announcementItem}>
          <AnnouncementRenderer htmlContent={item.content} />
        </View>
      ))}
    </ScrollView>
  );
};

// ============================================================================
// EXAMPLE 9: With Custom Styling Override
// ============================================================================

export const CustomStyledExample = () => {
  const html = `
    <h1>Custom Styled Content</h1>
    <p>This announcement uses custom styling to match specific design requirements.</p>
    <blockquote>Notice how the colors and fonts are customized.</blockquote>
  `;

  return (
    <View style={[styles.container, { backgroundColor: '#FFF9E6', padding: 20 }]}>
      <AnnouncementRenderer 
        htmlContent={html}
        // You can pass additional props if needed
      />
    </View>
  );
};

// ============================================================================
// EXAMPLE 10: Dynamic Content from API
// ============================================================================

export const ApiDrivenExample = () => {
  // Simulating data fetched from API
  const [apiData, setApiData] = React.useState(null);

  React.useEffect(() => {
    // Replace with actual API call
    fetch('https://your-api.com/api/announcements')
      .then(res => res.json())
      .then(data => setApiData(data))
      .catch(err => console.error(err));
  }, []);

  if (!apiData) {
    return <View>Loading...</View>;
  }

  return (
    <View style={styles.container}>
      <AnnouncementRenderer 
        htmlContent={apiData.description || apiData.content || apiData.body}
      />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  widgetCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  widgetContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  modalBody: {
    padding: 20,
  },
  announcementItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export default {
  BasicUsageExample,
  DashboardWidgetExample,
  LongContentExample,
  ModalContentExample,
  EmailStyleExample,
  EventInvitationExample,
  FacilityUpdateExample,
  MultipleAnnouncementsExample,
  CustomStyledExample,
  ApiDrivenExample,
};

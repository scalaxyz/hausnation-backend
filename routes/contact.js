const express = require('express');
const router = express.Router();
const verifyRecaptcha = require('../middleware/recaptcha');

// Contact form submission
router.post('/', verifyRecaptcha, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Here you can add email sending logic
    // For now, just log the contact form data
    console.log('Contact form submission:', {
      name,
      email,
      subject: subject || 'No subject',
      message,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement email sending with nodemailer or similar
    // Example:
    // await sendEmail({
    //   to: 'contact@hausnation.com',
    //   from: email,
    //   subject: subject || 'Contact Form - Hausnation',
    //   text: `From: ${name} (${email})\n\n${message}`
    // });

    res.json({
      success: true,
      message: 'Your message has been sent successfully!'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

module.exports = router;

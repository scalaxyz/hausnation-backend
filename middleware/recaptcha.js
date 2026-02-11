const axios = require('axios');

const verifyRecaptcha = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA token is required'
      });
    }

    // Verify token with Google
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken
        }
      }
    );

    const { success, score } = response.data;

    // reCAPTCHA v3 returns a score (0.0 - 1.0)
    // Higher score = more likely human
    if (!success || score < 0.5) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed'
      });
    }

    // Verification successful
    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'reCAPTCHA verification error'
    });
  }
};

module.exports = verifyRecaptcha;

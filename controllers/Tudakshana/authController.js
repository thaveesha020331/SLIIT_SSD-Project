import jwt from 'jsonwebtoken';
import User from '../../models/Tudakshana/User.js';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Validate role - prevent admin registration via API
    const validRoles = ['seller', 'customer'];
    const userRole = role && validRoles.includes(role) ? role : 'customer';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone,
      address,
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          themePreference: user.themePreference,
          profileImage: user.profileImage,
          paymentCard: user.paymentCard,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Check if role matches (if role is provided)
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This login is for ${role}s only. Please use the correct login page.`,
      });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          themePreference: user.themePreference,
          profileImage: user.profileImage,
          paymentCard: user.paymentCard,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          themePreference: user.themePreference,
          profileImage: user.profileImage,
          isActive: user.isActive,
          createdAt: user.createdAt,
          paymentCard: user.paymentCard,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, profileImage, paymentCard, themePreference } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (profileImage) user.profileImage = profileImage;
    if (themePreference && ['light', 'dark', 'green'].includes(themePreference)) {
      user.themePreference = themePreference;
    }
    if (paymentCard && typeof paymentCard === 'object') {
      if (paymentCard.clear === true) {
        user.paymentCard = {
          preferredPaymentMethod: 'cash_on_delivery',
          billingName: '',
          billingAddress: '',
          cardNumberLast4: '',
          cardBrand: '',
          expiryMonth: null,
          expiryYear: null,
          updatedAt: null,
        };
      } else {
        const currentPaymentCard = user.paymentCard?.toObject ? user.paymentCard.toObject() : (user.paymentCard || {});

        const nextPaymentCard = {
          preferredPaymentMethod: currentPaymentCard.preferredPaymentMethod || 'cash_on_delivery',
          billingName: currentPaymentCard.billingName || '',
          billingAddress: currentPaymentCard.billingAddress || '',
          cardNumberLast4: currentPaymentCard.cardNumberLast4 || '',
          cardBrand: currentPaymentCard.cardBrand || '',
          expiryMonth: currentPaymentCard.expiryMonth ?? null,
          expiryYear: currentPaymentCard.expiryYear ?? null,
          updatedAt: new Date(),
        };

        if (paymentCard.preferredPaymentMethod != null) {
          const preferredMethod = String(paymentCard.preferredPaymentMethod).trim();
          if (!['card', 'cash_on_delivery'].includes(preferredMethod)) {
            return res.status(400).json({
              success: false,
              message: 'Preferred payment method must be card or cash_on_delivery',
            });
          }
          nextPaymentCard.preferredPaymentMethod = preferredMethod;
        }

        if (paymentCard.billingName != null) {
          nextPaymentCard.billingName = String(paymentCard.billingName).trim();
        }

        if (paymentCard.billingAddress != null) {
          nextPaymentCard.billingAddress = String(paymentCard.billingAddress).trim();
        }

        if (paymentCard.stripeCardMeta && typeof paymentCard.stripeCardMeta === 'object') {
          const cardBrand = String(paymentCard.stripeCardMeta.cardBrand || '').trim();
          const last4 = String(paymentCard.stripeCardMeta.cardNumberLast4 || '').replace(/\D/g, '');
          const expiryMonth = paymentCard.stripeCardMeta.expiryMonth != null
            ? Number(paymentCard.stripeCardMeta.expiryMonth)
            : null;
          const expiryYear = paymentCard.stripeCardMeta.expiryYear != null
            ? Number(paymentCard.stripeCardMeta.expiryYear)
            : null;

          if (last4 && last4.length !== 4) {
            return res.status(400).json({
              success: false,
              message: 'Card last4 must be exactly 4 digits',
            });
          }

          nextPaymentCard.cardBrand = cardBrand;
          nextPaymentCard.cardNumberLast4 = last4;
          nextPaymentCard.expiryMonth = expiryMonth;
          nextPaymentCard.expiryYear = expiryYear;
        }

        user.paymentCard = nextPaymentCard;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          themePreference: user.themePreference,
          profileImage: user.profileImage,
          paymentCard: user.paymentCard,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
};

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  try {
    const { username, name, email, phone, password, dob, gender, fullName, address } =
      req.body;

    // Required fields: email and password only for mobile app
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedUsername = username ? username.trim() : normalizedEmail.split('@')[0];
    const trimmedPhone = phone ? phone.trim() : '';
    const trimmedFullName = fullName || name || trimmedUsername;
    const trimmedAddress = address ? address.trim() : "";

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: trimmedUsername },
        ...(trimmedPhone ? [{ phone: trimmedPhone }] : []),
      ],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email, username hoặc phone đã tồn tại!" });
    }

    // Create user with password - will be hashed by pre-save hook
    const newUser = new User({
      username: trimmedUsername,
      email: normalizedEmail,
      phone: trimmedPhone || '0000000000',
      password, // Password will be hashed in the pre-save hook
      fullName: trimmedFullName,
      address: trimmedAddress,
      dob: dob ? new Date(dob) : new Date('2000-01-01'),
      gender: gender || 'other',
    });

    await newUser.save();

    // Generate token for auto login after register
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(201).json({ 
      message: "Đăng ký thành công!",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Đăng ký thất bại. Lỗi server." });
  }
};

// Update the login function to return the address field
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the identifier is email, username or phone
    const user = await User.findOne({
      $or: [
        { email },
        { username: email }, // Using email field for username/phone too
        { phone: email },
      ],
    });

    // If user not found
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }

    // Direct password comparison using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your-fallback-secret-key",
      { expiresIn: "7d" }
    );

    // Return user info and token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        membership: user.membership,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        address: user.address, // Include address
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Đăng nhập thất bại", error: error.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.json({
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        membership: user.membership,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        address: user.address,
        avatar: user.avatar,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin profile", error: error.message });
  }
};

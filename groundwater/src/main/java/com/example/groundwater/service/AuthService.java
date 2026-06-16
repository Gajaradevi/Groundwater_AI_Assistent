package com.example.groundwater.service;

import com.example.groundwater.dto.*;
import com.example.groundwater.model.*;
import com.example.groundwater.repository.PasswordResetTokenRepository;
import com.example.groundwater.repository.UserRepository;
import com.example.groundwater.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    /**
     * Registers a new user, hashes password, saves as disabled, generates activation token, and sends email.
     */
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        user.setEnabled(false);

        User savedUser = userRepository.save(user);

        // Generate verification token
        String tokenString = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(tokenString, savedUser);
        verificationTokenRepository.save(verificationToken);

        // Send email
        emailService.sendVerificationEmail(savedUser.getEmail(), tokenString);

        return new RegisterResponse("Registration successful");
    }

    /**
     * Authenticates a user by email/password, checks if verified, and returns JWT details.
     */
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        if (!user.getEnabled()) {
            throw new IllegalArgumentException("Account not verified");
        }

        String jwtToken = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                jwtToken,
                "Login successful",
                user.getFullName(),
                user.getRole().name()
        );
    }

    /**
     * Verifies the email activation token and enables the user account.
     */
    public void verifyEmail(String tokenString) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Verification token has expired. Please register again.");
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
    }

    /**
     * Generates a password reset token for the user and sends a reset email.
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));

        // Clean up any old reset tokens for this user
        passwordResetTokenRepository.deleteByUser_Id(user.getId());

        String tokenString = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(tokenString, user);
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), tokenString);
    }

    /**
     * Validates the password reset token, updates the password, and cleans up the token.
     */
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Password reset token has expired. Please try again.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }
}

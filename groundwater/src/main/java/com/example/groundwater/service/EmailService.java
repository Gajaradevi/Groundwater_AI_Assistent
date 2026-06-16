package com.example.groundwater.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Sends the verification email containing the token link.
     */
    public void sendVerificationEmail(String email, String token) {
        String verificationUrl = "http://localhost:8080/api/auth/verify?token=" + token;
        System.out.println("Verification URL:");
        System.out.println(verificationUrl);
        log.info("Bypassed SMTP. Verification URL logged to console for {}", email);
    }

    /**
     * Sends the password reset email.
     */
    public void sendPasswordResetEmail(String email, String token) {
        // Redirects to frontend where reset password screen is shown
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        System.out.println("Reset URL:");
        System.out.println(resetUrl);
        log.info("Bypassed SMTP. Reset URL logged to console for {}", email);
    }
}

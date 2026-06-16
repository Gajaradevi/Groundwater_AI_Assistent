package com.example.groundwater.controller;

import com.example.groundwater.dto.*;
import com.example.groundwater.service.AuthService;
import com.example.groundwater.service.EmailService;
import com.example.groundwater.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication API", description = "APIs for user registration, verification, login, and password management")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final EmailService emailService;

    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Registers a new user and sends an activation email")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        try {
            RegisterResponse response = authService.register(request);
            ApiResponse<RegisterResponse> apiResponse = new ApiResponse<>(
                    true,
                    "Account created successfully. Please login.",
                    200,
                    response
            );
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<RegisterResponse> apiResponse = new ApiResponse<>(
                    false,
                    e.getMessage(),
                    400,
                    null
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        } catch (Exception e) {
            ApiResponse<RegisterResponse> apiResponse = new ApiResponse<>(
                    false,
                    "Registration failed: " + e.getMessage(),
                    500,
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Logs in a verified user and returns a JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            ApiResponse<LoginResponse> apiResponse = new ApiResponse<>(
                    true,
                    "Login successful",
                    200,
                    response
            );
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            // Check specific error messages to match the requested error types
            HttpStatus status = HttpStatus.UNAUTHORIZED;
            if (e.getMessage().contains("User not found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (e.getMessage().contains("Account not verified")) {
                status = HttpStatus.FORBIDDEN;
            }
            
            ApiResponse<LoginResponse> apiResponse = new ApiResponse<>(
                    false,
                    e.getMessage(),
                    status.value(),
                    null
            );
            return ResponseEntity.status(status).body(apiResponse);
        } catch (Exception e) {
            ApiResponse<LoginResponse> apiResponse = new ApiResponse<>(
                    false,
                    "Login failed: " + e.getMessage(),
                    500,
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }



    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Generates a reset token and sends an email to the user")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request);
            ApiResponse<String> apiResponse = new ApiResponse<>(
                    true,
                    "Password reset instructions sent to your email",
                    200,
                    "Email Sent"
            );
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<String> apiResponse = new ApiResponse<>(
                    false,
                    e.getMessage(),
                    404,
                    null
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiResponse);
        } catch (Exception e) {
            ApiResponse<String> apiResponse = new ApiResponse<>(
                    false,
                    "Request failed: " + e.getMessage(),
                    500,
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Resets user password using the provided reset token")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            ApiResponse<String> apiResponse = new ApiResponse<>(
                    true,
                    "Password has been reset successfully",
                    200,
                    "Password Reset Successful"
            );
            return ResponseEntity.ok(apiResponse);
        } catch (IllegalArgumentException e) {
            ApiResponse<String> apiResponse = new ApiResponse<>(
                    false,
                    e.getMessage(),
                    400,
                    null
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        } catch (Exception e) {
            ApiResponse<String> apiResponse = new ApiResponse<>(
                    false,
                    "Reset failed: " + e.getMessage(),
                    500,
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }
}

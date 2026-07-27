package com.blogplatform.service;

import com.blogplatform.dto.ChangePasswordRequest;
import com.blogplatform.dto.ForgotPasswordRequest;
import com.blogplatform.dto.RegisterRequest;
import com.blogplatform.dto.ResetPasswordRequest;
import com.blogplatform.dto.UpdateProfileRequest;
import com.blogplatform.entity.User;
import com.blogplatform.entity.UserRole;
import com.blogplatform.exception.BadRequestException;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.exception.UnauthorizedException;
import com.blogplatform.repository.UserRepository;
import com.blogplatform.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered.");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername().toLowerCase().trim())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        // Generate email verification token (JWT) and send it
        String verificationToken = tokenProvider.generateTokenFromUserId(savedUser.getId());
        emailService.sendEmailVerification(savedUser.getEmail(), verificationToken);

        return savedUser;
    }

    @Transactional
    public void verifyEmail(String token) {
        if (!tokenProvider.validateToken(token)) {
            throw new BadRequestException("Invalid or expired email verification token.");
        }

        UUID userId = tokenProvider.getUserIdFromJWT(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified.");
        }

        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("Email verified successfully for user: {}", user.getUsername());
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", user.getUsername());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Short-lived verification token
        String resetToken = tokenProvider.generateTokenFromUserId(user.getId());
        emailService.sendPasswordReset(user.getEmail(), resetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!tokenProvider.validateToken(request.getToken())) {
            throw new BadRequestException("Invalid or expired password reset token.");
        }

        UUID userId = tokenProvider.getUserIdFromJWT(request.getToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password reset successfully for user: {}", user.getUsername());
    }

    @Transactional(readOnly = true)
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    @Transactional
    public User updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getSocialLinks() != null) user.setSocialLinks(request.getSocialLinks());

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateUserRole(UUID userId, UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        userRepository.delete(user); // Triggers soft delete via @SQLDelete
        log.info("User soft-deleted: {}", user.getUsername());
    }
}

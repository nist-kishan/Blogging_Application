package com.blogplatform.service;

import com.blogplatform.dto.RegisterRequest;
import com.blogplatform.dto.UpdateProfileRequest;
import com.blogplatform.entity.User;
import com.blogplatform.entity.UserRole;
import com.blogplatform.exception.BadRequestException;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.repository.UserRepository;
import com.blogplatform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .email("test@email.com")
                .username("testuser")
                .fullName("Test User")
                .password("encoded_pass")
                .role(UserRole.USER)
                .emailVerified(false)
                .build();
    }

    @Test
    void registerUser_Success() {
        RegisterRequest request = new RegisterRequest("test@email.com", "testuser", "Test User", "plain_password");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(tokenProvider.generateTokenFromUserId(user.getId())).thenReturn("mock_verification_token");

        User registered = userService.registerUser(request);

        assertNotNull(registered);
        assertEquals(request.getEmail(), registered.getEmail());
        assertEquals("encoded_pass", registered.getPassword());
        verify(emailService, times(1)).sendEmailVerification(eq("test@email.com"), eq("mock_verification_token"));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_Fail_EmailExists() {
        RegisterRequest request = new RegisterRequest("test@email.com", "testuser", "Test User", "plain_password");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> {
            userService.registerUser(request);
        });

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfile_Success() {
        UpdateProfileRequest request = new UpdateProfileRequest("Updated Name", "Updated Bio", "http://avatar.url", "http://social.url");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updated = userService.updateProfile(userId, request);

        assertEquals("Updated Name", updated.getFullName());
        assertEquals("Updated Bio", updated.getBio());
        assertEquals("http://avatar.url", updated.getAvatarUrl());
        assertEquals("http://social.url", updated.getSocialLinks());
    }

    @Test
    void updateUserRole_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updated = userService.updateUserRole(userId, UserRole.ADMIN);

        assertEquals(UserRole.ADMIN, updated.getRole());
    }
}

package com.blogplatform.controller;

import com.blogplatform.dto.ApiResponse;
import com.blogplatform.dto.ChangePasswordRequest;
import com.blogplatform.dto.ForgotPasswordRequest;
import com.blogplatform.dto.LoginRequest;
import com.blogplatform.dto.RegisterRequest;
import com.blogplatform.dto.ResetPasswordRequest;
import com.blogplatform.dto.UserResponse;
import com.blogplatform.entity.RefreshToken;
import com.blogplatform.entity.User;
import com.blogplatform.mapper.UserMapper;
import com.blogplatform.security.JwtTokenProvider;
import com.blogplatform.security.UserPrincipal;
import com.blogplatform.service.RefreshTokenService;
import com.blogplatform.service.UserService;
import com.blogplatform.exception.UnauthorizedException;
import com.blogplatform.util.CookieUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;

    @Value("${app.jwt.accessTokenExpirationMs}")
    private long accessTokenExpirationMs;

    @Value("${app.jwt.refreshTokenExpirationMs}")
    private long refreshTokenExpirationMs;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.sameSite:Lax}")
    private String cookieSameSite;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.registerUser(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful. Please check your email to verify your account.", userMapper.toResponse(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        // Check if user exists
        User user = userService.getUserById(principal.getId());

        // Generate Tokens
        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        // Set HttpOnly Cookies
        CookieUtils.createCookie(response, "accessToken", accessToken, accessTokenExpirationMs, cookieSecure, cookieSameSite);
        CookieUtils.createCookie(response, "refreshToken", refreshToken.getToken(), refreshTokenExpirationMs, cookieSecure, cookieSameSite);

        log.info("User {} logged in successfully.", user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Login successful", userMapper.toResponse(user)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        // Clear cookies
        CookieUtils.clearCookie(response, "accessToken", cookieSecure, cookieSameSite);

        CookieUtils.getCookie(request, "refreshToken")
                .map(Cookie::getValue)
                .ifPresent(token -> {
                    refreshTokenService.deleteByToken(token);
                    CookieUtils.clearCookie(response, "refreshToken", cookieSecure, cookieSameSite);
                });

        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Void>> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String token = CookieUtils.getCookie(request, "refreshToken")
                .map(Cookie::getValue)
                .orElseThrow(() -> new UnauthorizedException("Refresh token is missing. Please log in."));

        RefreshToken refreshToken = refreshTokenService.findByToken(token)
                .map(refreshTokenService::verifyExpiration)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token. Please log in again."));

        User user = refreshToken.getUser();

        // Rotate Access Token
        String newAccessToken = tokenProvider.generateTokenFromUserId(user.getId());
        CookieUtils.createCookie(response, "accessToken", newAccessToken, accessTokenExpirationMs, cookieSecure, cookieSameSite);

        // Rotate Refresh Token
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
        CookieUtils.createCookie(response, "refreshToken", newRefreshToken.getToken(), refreshTokenExpirationMs, cookieSecure, cookieSameSite);

        log.info("Token refreshed successfully for user: {}", user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully"));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam("token") String token) {
        userService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. You can now log in."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset link has been sent to your email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully. You can now log in."));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", userMapper.toResponse(user)));
    }
}

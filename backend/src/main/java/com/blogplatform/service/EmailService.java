package com.blogplatform.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Value("${app.email.verification-url}")
    private String verificationBaseUrl;

    @Value("${app.email.reset-password-url}")
    private String resetPasswordBaseUrl;

    public void sendEmailVerification(String email, String token) {
        String verificationUrl = verificationBaseUrl + "?token=" + token;
        String subject = "Verify your Email - Blog Platform";
        String body = "Please click the following link to verify your email address:\n" + verificationUrl;

        log.info("=========================================");
        log.info("EMAIL VERIFICATION LINK SENT TO: {}", email);
        log.info("Verification URL: {}", verificationUrl);
        log.info("=========================================");

        sendMail(email, subject, body);
    }

    public void sendPasswordReset(String email, String token) {
        String resetUrl = resetPasswordBaseUrl + "?token=" + token;
        String subject = "Reset your Password - Blog Platform";
        String body = "Please click the following link to reset your password:\n" + resetUrl;

        log.info("=========================================");
        log.info("PASSWORD RESET LINK SENT TO: {}", email);
        log.info("Reset URL: {}", resetUrl);
        log.info("=========================================");

        sendMail(email, subject, body);
    }

    private void sendMail(String to, String subject, String body) {
        if (mailFrom == null || mailFrom.isBlank()) {
            log.warn("SMTP credentials are not configured. Email NOT sent to {} (logged to console above)", to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}. Logged fallback link to console above.", to, e.getMessage());
        }
    }
}

package com.blogplatform.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.jdbc.DataSourceBuilder;
import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:jdbc:postgresql://localhost:5432/blog_db}")
    private String databaseUrl;

    @Value("${DATABASE_USERNAME:postgres}")
    private String databaseUsername;

    @Value("${DATABASE_PASSWORD:root}")
    private String databasePassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
            try {
                URI dbUri = new URI(databaseUrl);
                String host = dbUri.getHost();
                int port = dbUri.getPort();
                String dbName = dbUri.getPath();
                
                String username = "";
                String password = "";
                
                if (dbUri.getUserInfo() != null) {
                    String[] userInfo = dbUri.getUserInfo().split(":");
                    username = userInfo[0];
                    if (userInfo.length > 1) {
                        password = userInfo[1];
                    }
                }
                
                String jdbcUrl = "jdbc:postgresql://" + host + (port != -1 ? ":" + port : "") + dbName;
                if (!"localhost".equals(host) && !"127.0.0.1".equals(host)) {
                    jdbcUrl += "?sslmode=require";
                }
                
                return DataSourceBuilder.create()
                        .url(jdbcUrl)
                        .username(username)
                        .password(password)
                        .driverClassName("org.postgresql.Driver")
                        .build();
            } catch (URISyntaxException e) {
                throw new RuntimeException("Failed to parse DATABASE_URL: " + databaseUrl, e);
            }
        }
        
        return DataSourceBuilder.create()
                .url(databaseUrl)
                .username(databaseUsername)
                .password(databasePassword)
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}

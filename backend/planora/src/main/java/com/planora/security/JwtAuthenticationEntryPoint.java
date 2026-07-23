package com.planora.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.planora.common.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse body = ErrorResponse.builder()
                .status(401)
                .error("Unauthorized")
                .message("Authentication required — provide a valid Bearer token")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        mapper.findAndRegisterModules();
        mapper.writeValue(response.getOutputStream(), body);
    }
}

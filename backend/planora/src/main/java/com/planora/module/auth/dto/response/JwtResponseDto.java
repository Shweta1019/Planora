package com.planora.module.auth.dto.response;

import com.planora.common.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JwtResponseDto {

    private String token;
    private String email;
    private String fullName;
    private Role role;
    private Long userId;
    private String profileImage;
}

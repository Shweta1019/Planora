package com.planora.module.document.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DocumentResponseDto {

    private Long documentId;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private Long projectId;
    private String projectName;
    private Long taskId;
    private String taskTitle;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime createdAt;
}

package com.planora.module.document.mapper;

import com.planora.module.document.dto.response.DocumentResponseDto;
import com.planora.module.document.entity.Document;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    public DocumentResponseDto toResponseDto(Document d) {
        return DocumentResponseDto.builder()
                .documentId(d.getDocumentId())
                .fileName(d.getFileName())
                .filePath(d.getFilePath())
                .fileType(d.getFileType())
                .fileSize(d.getFileSize())
                .projectId(d.getProject() != null ? d.getProject().getProjectId() : null)
                .projectName(d.getProject() != null ? d.getProject().getProjectName() : null)
                .taskId(d.getTask() != null ? d.getTask().getTaskId() : null)
                .taskTitle(d.getTask() != null ? d.getTask().getTitle() : null)
                .uploadedById(d.getUploadedBy() != null ? d.getUploadedBy().getUserId() : null)
                .uploadedByName(d.getUploadedBy() != null ? d.getUploadedBy().getFullName() : null)
                .createdAt(d.getCreatedAt())
                .build();
    }
}

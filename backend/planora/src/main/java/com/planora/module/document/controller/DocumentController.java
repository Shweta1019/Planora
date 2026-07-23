package com.planora.module.document.controller;

import com.planora.common.response.ApiResponse;
import com.planora.module.document.dto.response.DocumentResponseDto;
import com.planora.module.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponseDto>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) Long uploadedById) throws IOException {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File uploaded",
                        documentService.uploadDocument(file, projectId, taskId, uploadedById)));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<DocumentResponseDto>>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success("Documents fetched", documentService.getByProject(projectId)));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<ApiResponse<List<DocumentResponseDto>>> getByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success("Documents fetched", documentService.getByTask(taskId)));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted"));
    }
}

package com.planora.module.resource.controller;

import com.planora.common.response.ApiResponse;
import com.planora.module.resource.dto.request.ResourceCreateRequestDto;
import com.planora.module.resource.dto.request.ResourceUpdateRequestDto;
import com.planora.module.resource.dto.response.ResourceResponseDto;
import com.planora.module.resource.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> create(@Valid @RequestBody ResourceCreateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created", resourceService.createResource(dto)));
    }

    @PutMapping("/{resourceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> update(@PathVariable Long resourceId,
                                                                    @RequestBody ResourceUpdateRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Resource updated", resourceService.updateResource(resourceId, dto)));
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> getById(@PathVariable Long resourceId) {
        return ResponseEntity.ok(ApiResponse.success("Resource fetched", resourceService.getById(resourceId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceResponseDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Resources fetched", resourceService.getAll()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<ResourceResponseDto>>> getAvailable() {
        return ResponseEntity.ok(ApiResponse.success("Available resources", resourceService.getAvailable()));
    }

    @DeleteMapping("/{resourceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long resourceId) {
        resourceService.deleteResource(resourceId);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted"));
    }
}

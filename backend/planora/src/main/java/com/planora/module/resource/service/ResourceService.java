package com.planora.module.resource.service;

import com.planora.module.resource.dto.request.ResourceCreateRequestDto;
import com.planora.module.resource.dto.request.ResourceUpdateRequestDto;
import com.planora.module.resource.dto.response.ResourceResponseDto;
import com.planora.module.resource.entity.Resource;
import com.planora.module.resource.exception.ResourceNotFoundException;
import com.planora.module.resource.mapper.ResourceMapper;
import com.planora.module.resource.repository.ResourceRepository;
import com.planora.module.user.entity.User;
import com.planora.module.user.exception.UserNotFoundException;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final ResourceMapper resourceMapper;

    public ResourceResponseDto createResource(ResourceCreateRequestDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException(dto.getUserId()));

        Resource resource = Resource.builder()
                .resourceType(dto.getResourceType())
                .skillSet(dto.getSkillSet())
                .description(dto.getDescription())
                .availabilityHours(dto.getAvailabilityHours() != null ? dto.getAvailabilityHours() : 40)
                .user(user)
                .build();

        return resourceMapper.toResponseDto(resourceRepository.save(resource));
    }

    public ResourceResponseDto updateResource(Long resourceId, ResourceUpdateRequestDto dto) {
        Resource resource = findOrThrow(resourceId);

        if (dto.getResourceType() != null)      resource.setResourceType(dto.getResourceType());
        if (dto.getSkillSet() != null)          resource.setSkillSet(dto.getSkillSet());
        if (dto.getDescription() != null)       resource.setDescription(dto.getDescription());
        if (dto.getAvailabilityHours() != null) resource.setAvailabilityHours(dto.getAvailabilityHours());
        if (dto.getIsAvailable() != null)       resource.setAvailable(dto.getIsAvailable());

        return resourceMapper.toResponseDto(resourceRepository.save(resource));
    }

    public ResourceResponseDto getById(Long resourceId) {
        return resourceMapper.toResponseDto(findOrThrow(resourceId));
    }

    public List<ResourceResponseDto> getAll() {
        return resourceRepository.findAll().stream()
                .map(resourceMapper::toResponseDto).collect(Collectors.toList());
    }

    public List<ResourceResponseDto> getAvailable() {
        return resourceRepository.findByIsAvailableTrue().stream()
                .map(resourceMapper::toResponseDto).collect(Collectors.toList());
    }

    public void deleteResource(Long resourceId) {
        if (!resourceRepository.existsById(resourceId)) throw new ResourceNotFoundException(resourceId);
        resourceRepository.deleteById(resourceId);
    }

    private Resource findOrThrow(Long id) {
        return resourceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(id));
    }
}

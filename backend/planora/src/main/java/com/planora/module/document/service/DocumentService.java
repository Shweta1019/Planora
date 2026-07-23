package com.planora.module.document.service;

import com.planora.module.document.dto.response.DocumentResponseDto;
import com.planora.module.document.entity.Document;
import com.planora.module.document.mapper.DocumentMapper;
import com.planora.module.document.repository.DocumentRepository;
import com.planora.module.project.repository.ProjectRepository;
import com.planora.module.task.repository.TaskRepository;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final DocumentMapper documentMapper;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public DocumentResponseDto uploadDocument(MultipartFile file,
                                              Long projectId,
                                              Long taskId,
                                              Long uploadedById) throws IOException {
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);

        String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path target = dir.resolve(uniqueName);
        file.transferTo(target);

        Document.DocumentBuilder builder = Document.builder()
                .fileName(file.getOriginalFilename())
                .filePath(target.toString())
                .fileType(file.getContentType())
                .fileSize(file.getSize());

        if (projectId != null)    projectRepository.findById(projectId).ifPresent(builder::project);
        if (taskId != null)       taskRepository.findById(taskId).ifPresent(builder::task);
        if (uploadedById != null) userRepository.findById(uploadedById).ifPresent(builder::uploadedBy);

        return documentMapper.toResponseDto(documentRepository.save(builder.build()));
    }

    public List<DocumentResponseDto> getByProject(Long projectId) {
        return documentRepository.findByProjectProjectId(projectId).stream()
                .map(documentMapper::toResponseDto).collect(Collectors.toList());
    }

    public List<DocumentResponseDto> getByTask(Long taskId) {
        return documentRepository.findByTaskTaskId(taskId).stream()
                .map(documentMapper::toResponseDto).collect(Collectors.toList());
    }

    public void deleteDocument(Long documentId) {
        documentRepository.findById(documentId).ifPresent(doc -> {
            try { Files.deleteIfExists(Paths.get(doc.getFilePath())); } catch (IOException ignored) {}
            documentRepository.delete(doc);
        });
    }
}

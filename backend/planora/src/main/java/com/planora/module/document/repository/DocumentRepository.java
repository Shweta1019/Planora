package com.planora.module.document.repository;

import com.planora.module.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByProjectProjectId(Long projectId);
    List<Document> findByTaskTaskId(Long taskId);
    List<Document> findByUploadedByUserId(Long userId);
}

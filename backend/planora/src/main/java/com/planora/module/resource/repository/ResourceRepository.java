package com.planora.module.resource.repository;

import com.planora.module.resource.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Optional<Resource> findByUserUserId(Long userId);
    List<Resource> findByIsAvailableTrue();
    List<Resource> findByResourceTypeContainingIgnoreCase(String resourceType);
}

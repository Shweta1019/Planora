package com.planora.module.resource.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(Long resourceId) {
        super("Resource not found with id: " + resourceId);
    }
}

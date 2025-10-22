package com.dgsi.maintenance.service;

public class PrestationLimitExceededException extends RuntimeException {
    public PrestationLimitExceededException(String message) {
        super(message);
    }
}

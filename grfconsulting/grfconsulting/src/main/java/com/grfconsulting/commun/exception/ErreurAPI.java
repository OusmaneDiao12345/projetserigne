package com.grfconsulting.commun.exception;

import java.time.Instant;
import java.util.Map;

public record ErreurAPI(Instant timestamp, int status, String error, String message, String path,
                       Map<String, String> fieldErrors) {
}

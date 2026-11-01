package com.grfconsulting.commun.exception;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GestionnaireExceptionsAPI {

    @ExceptionHandler(RessourceIntrouvableException.class)
    ResponseEntity<ErreurAPI> handleNotFound(RessourceIntrouvableException exception, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(ConflitMetierException.class)
    ResponseEntity<ErreurAPI> handleConflict(ConflitMetierException exception, HttpServletRequest request) {
        return response(HttpStatus.CONFLICT, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(AccesInterditException.class)
    ResponseEntity<ErreurAPI> handleForbidden(AccesInterditException exception, HttpServletRequest request) {
        return response(HttpStatus.FORBIDDEN, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(ServiceIAIndisponibleException.class)
    ResponseEntity<ErreurAPI> handleAiUnavailable(ServiceIAIndisponibleException exception, HttpServletRequest request) {
        return response(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(PaiementIndisponibleException.class)
    ResponseEntity<ErreurAPI> handlePaymentUnavailable(PaiementIndisponibleException exception, HttpServletRequest request) {
        return response(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(SignatureWebhookInvalideException.class)
    ResponseEntity<ErreurAPI> handleWebhookSignature(SignatureWebhookInvalideException exception, HttpServletRequest request) {
        return response(HttpStatus.UNAUTHORIZED, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ErreurAPI> handleAuthentication(AuthenticationException exception, HttpServletRequest request) {
        return response(HttpStatus.UNAUTHORIZED, "Numéro, mot de passe ou état de compte invalide.", request, Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErreurAPI> handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> errors = exception.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(error -> error.getField(), error -> error.getDefaultMessage(), (first, ignored) -> first));
        return response(HttpStatus.BAD_REQUEST, "Les données envoyées ne sont pas valides.", request, errors);
    }

    private ResponseEntity<ErreurAPI> response(HttpStatus status, String message, HttpServletRequest request,
                                               Map<String, String> fieldErrors) {
        return ResponseEntity.status(status).body(new ErreurAPI(Instant.now(), status.value(), status.getReasonPhrase(),
                message, request.getRequestURI(), fieldErrors));
    }
}

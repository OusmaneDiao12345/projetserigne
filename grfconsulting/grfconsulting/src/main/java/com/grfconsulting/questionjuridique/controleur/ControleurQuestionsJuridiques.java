package com.grfconsulting.questionjuridique.controleur;

import java.net.URI;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import com.grfconsulting.questionjuridique.dto.DemandeQuestionJuridique;
import com.grfconsulting.questionjuridique.dto.ReponseQuestionJuridique;
import com.grfconsulting.questionjuridique.service.ServiceQuestionsJuridiques;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/legal-questions")
@Tag(name = "Questions juridiques")
public class ControleurQuestionsJuridiques {

    private final ServiceQuestionsJuridiques service;

    public ControleurQuestionsJuridiques(ServiceQuestionsJuridiques service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Poser une question juridique", description = "Recherche les textes pertinents, génère et enregistre une réponse.")
    public ResponseEntity<ReponseQuestionJuridique> ask(@Valid @RequestBody DemandeQuestionJuridique request,
                                                      @AuthenticationPrincipal Jwt jeton) {
        ReponseQuestionJuridique response = service.ask(request, UUID.fromString(jeton.getSubject()));
        return ResponseEntity.created(URI.create("/api/v1/legal-questions/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter une question et sa réponse")
    public ReponseQuestionJuridique getById(@PathVariable UUID id, @AuthenticationPrincipal Jwt jeton) {
        return service.getById(id, UUID.fromString(jeton.getSubject()));
    }
}

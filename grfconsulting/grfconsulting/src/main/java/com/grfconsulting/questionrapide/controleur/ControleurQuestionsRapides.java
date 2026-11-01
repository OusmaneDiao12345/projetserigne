package com.grfconsulting.questionrapide.controleur;

import com.grfconsulting.questionrapide.dto.DemandeQuestionInvitee;
import com.grfconsulting.questionrapide.dto.ReponseQuestionInvitee;
import com.grfconsulting.questionrapide.dto.ReponseSoumissionInvitee;
import com.grfconsulting.questionrapide.service.ServiceQuestionsInvitees;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Permet au visiteur de payer une question rapide sans créer de compte et de récupérer sa réponse. */
@RestController
@RequestMapping("/api/v1/questions-rapides")
@Tag(name = "Question rapide visiteur")
public class ControleurQuestionsRapides {
    private final ServiceQuestionsInvitees service;
    public ControleurQuestionsRapides(ServiceQuestionsInvitees service) { this.service = service; }

    @PostMapping("/paiements")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer la caisse DEXPAY d'une question visiteur (1 000 FCFA).")
    public ReponseSoumissionInvitee soumettre(@Valid @RequestBody DemandeQuestionInvitee demande) {
        return service.soumettre(demande);
    }

    @GetMapping("/{referencePaiement}")
    @Operation(summary = "Lire l'état du paiement et la réponse rapide après confirmation webhook.")
    public ReponseQuestionInvitee obtenir(@PathVariable String referencePaiement) {
        return service.obtenirResultat(referencePaiement);
    }
}

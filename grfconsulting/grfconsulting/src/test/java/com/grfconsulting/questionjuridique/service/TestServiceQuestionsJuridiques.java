package com.grfconsulting.questionjuridique.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import com.grfconsulting.adhesion.depot.DepotAdhesions;
import com.grfconsulting.adhesion.domaine.EtatAdhesion;
import com.grfconsulting.authentification.depot.DepotUtilisateurs;
import com.grfconsulting.authentification.domaine.Utilisateur;
import com.grfconsulting.questionjuridique.domaine.DomaineJuridique;
import com.grfconsulting.questionjuridique.domaine.QuestionJuridique;
import com.grfconsulting.questionjuridique.dto.DemandeQuestionJuridique;
import com.grfconsulting.questionjuridique.convertisseur.ConvertisseurQuestionJuridique;
import com.grfconsulting.questionjuridique.convertisseur.ConvertisseurQuestionJuridiqueImpl;
import com.grfconsulting.questionjuridique.depot.DepotQuestionsJuridiques;
import com.grfconsulting.questionjuridique.service.impl.ServiceQuestionsJuridiquesImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TestServiceQuestionsJuridiques {
    @Mock DepotQuestionsJuridiques depotQuestions;
    @Mock GenerateurReponseJuridique generateurReponse;
    @Mock DepotUtilisateurs depotUtilisateurs;
    @Mock DepotAdhesions depotAdhesions;
    private ServiceQuestionsJuridiques service;

    @BeforeEach
    void initialiser() {
        ConvertisseurQuestionJuridique convertisseur = new ConvertisseurQuestionJuridiqueImpl();
        service = new ServiceQuestionsJuridiquesImpl(depotQuestions, convertisseur, generateurReponse,
                depotUtilisateurs, depotAdhesions);
    }

    @Test
    void genererEtEnregistrerUneReponsePourUnMembreActif() {
        var demande = new DemandeQuestionJuridique(DomaineJuridique.DROIT_DU_TRAVAIL, "  Quels sont mes droits ?  ");
        UUID utilisateurId = UUID.randomUUID();
        when(depotAdhesions.existsByUtilisateurIdAndEtatAndExpireLeAfter(
                org.mockito.ArgumentMatchers.eq(utilisateurId), org.mockito.ArgumentMatchers.eq(EtatAdhesion.ACTIVE), any(Instant.class)))
                .thenReturn(true);
        when(depotUtilisateurs.findById(utilisateurId)).thenReturn(Optional.of(new Utilisateur(
                "Membre test", "+221770000000", LocalDate.of(1990, 1, 1), "mot-de-passe-hache")));
        when(generateurReponse.generate(demande.domain(), "Quels sont mes droits ?"))
                .thenReturn(new GenerateurReponseJuridique.ReponseGeneree("Réponse fondée sur les textes.", "Article 25"));
        when(depotQuestions.save(any(QuestionJuridique.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var reponse = service.ask(demande, utilisateurId);

        assertThat(reponse.id()).isNotNull();
        assertThat(reponse.answer()).isEqualTo("Réponse fondée sur les textes.");
        assertThat(reponse.sourceReferences()).isEqualTo("Article 25");
        assertThat(reponse.question()).isEqualTo("Quels sont mes droits ?");
        verify(depotQuestions).save(any(QuestionJuridique.class));
    }
}

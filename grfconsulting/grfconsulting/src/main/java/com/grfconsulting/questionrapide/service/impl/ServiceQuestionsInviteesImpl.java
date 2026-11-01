package com.grfconsulting.questionrapide.service.impl;

import java.util.UUID;

import com.grfconsulting.paiement.configuration.ConfigurationPaiement;
import com.grfconsulting.paiement.depot.DepotPaiements;
import com.grfconsulting.paiement.domaine.EtatPaiement;
import com.grfconsulting.paiement.domaine.Paiement;
import com.grfconsulting.paiement.domaine.TypePaiement;
import com.grfconsulting.paiement.service.ServiceCaisseDexpay;
import com.grfconsulting.questionrapide.depot.DepotQuestionsInvitees;
import com.grfconsulting.questionrapide.domaine.EtatQuestionInvitee;
import com.grfconsulting.questionrapide.domaine.QuestionInvitee;
import com.grfconsulting.questionrapide.dto.DemandeQuestionInvitee;
import com.grfconsulting.questionrapide.dto.ReponseQuestionInvitee;
import com.grfconsulting.questionrapide.dto.ReponseSoumissionInvitee;
import com.grfconsulting.questionrapide.service.ServiceQuestionsInvitees;
import com.grfconsulting.questionjuridique.service.GenerateurReponseJuridique;
import com.grfconsulting.paiement.shared.ServiceNormalisationOperateur;
import com.grfconsulting.commun.exception.ConflitMetierException;
import com.grfconsulting.commun.exception.RessourceIntrouvableException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Gère le paiement de 1 000 FCFA et la récupération de la réponse rapide d'un visiteur. */
@Service
public class ServiceQuestionsInviteesImpl implements ServiceQuestionsInvitees {
    private static final long TARIF_QUESTION_FCFA = 1_000;
    private final DepotQuestionsInvitees depotQuestions;
    private final DepotPaiements depotPaiements;
    private final ServiceCaisseDexpay caisseDexpay;
    private final ConfigurationPaiement configuration;
    private final GenerateurReponseJuridique generateurReponse;

    public ServiceQuestionsInviteesImpl(DepotQuestionsInvitees depotQuestions, DepotPaiements depotPaiements,
            ServiceCaisseDexpay caisseDexpay, ConfigurationPaiement configuration, GenerateurReponseJuridique generateurReponse) {
        this.depotQuestions = depotQuestions; this.depotPaiements = depotPaiements;
        this.caisseDexpay = caisseDexpay; this.configuration = configuration; this.generateurReponse = generateurReponse;
    }

    @Override
    @Transactional
    public ReponseSoumissionInvitee soumettre(DemandeQuestionInvitee demande) {
        String operateur = ServiceNormalisationOperateur.normaliser(demande.operateur());
        QuestionInvitee question = depotQuestions.save(new QuestionInvitee(demande.domaine(), demande.question().trim()));
        String reference = "GRF-QST-" + UUID.randomUUID();
        Paiement paiement = depotPaiements.save(new Paiement(reference, null, null, question.getId(),
                TypePaiement.QUESTION_RAPIDE, configuration.getFournisseur(), operateur, TARIF_QUESTION_FCFA));
        String url = caisseDexpay.creerCaisse(reference, "Réponse rapide GRF CONSULTING", TARIF_QUESTION_FCFA);
        paiement.definirUrlPaiement(url);
        depotPaiements.save(paiement);
        return new ReponseSoumissionInvitee(reference, url, TARIF_QUESTION_FCFA, "XOF", "EN_ATTENTE");
    }

    @Override
    @Transactional
    public ReponseQuestionInvitee obtenirResultat(String referencePaiement) {
        Paiement paiement = depotPaiements.findByReference(referencePaiement)
                .orElseThrow(() -> new RessourceIntrouvableException("Paiement de question rapide introuvable."));
        if (paiement.getType() != TypePaiement.QUESTION_RAPIDE || paiement.getQuestionInviteeId() == null) {
            throw new RessourceIntrouvableException("Réponse rapide introuvable.");
        }
        QuestionInvitee question = depotQuestions.findById(paiement.getQuestionInviteeId())
                .orElseThrow(() -> new RessourceIntrouvableException("Question rapide introuvable."));
        if (paiement.getEtat() != EtatPaiement.PAYE) {
            return new ReponseQuestionInvitee(question.getId(), paiement.getEtat().name(), null, null,
                    "Le paiement n'est pas encore confirmé.");
        }
        if (question.getEtat() != EtatQuestionInvitee.REPONDUE) {
            GenerateurReponseJuridique.ReponseGeneree generated = generateurReponse.generate(question.getDomaine(), question.getQuestion());
            question.enregistrerReponse(generated.answer(), generated.sourceReferences());
            depotQuestions.save(question);
        }
        return new ReponseQuestionInvitee(question.getId(), question.getEtat().name(), question.getReponse(),
                question.getReferencesTextes(), "Réponse générée à partir des textes indexés.");
    }
}

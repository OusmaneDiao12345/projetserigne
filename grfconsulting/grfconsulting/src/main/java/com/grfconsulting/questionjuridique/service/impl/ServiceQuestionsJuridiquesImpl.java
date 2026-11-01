package com.grfconsulting.questionjuridique.service.impl;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grfconsulting.questionjuridique.domaine.QuestionJuridique;
import com.grfconsulting.questionjuridique.dto.DemandeQuestionJuridique;
import com.grfconsulting.questionjuridique.dto.ReponseQuestionJuridique;
import com.grfconsulting.questionjuridique.convertisseur.ConvertisseurQuestionJuridique;
import com.grfconsulting.questionjuridique.depot.DepotQuestionsJuridiques;
import com.grfconsulting.questionjuridique.service.GenerateurReponseJuridique;
import com.grfconsulting.questionjuridique.service.ServiceQuestionsJuridiques;
import com.grfconsulting.authentification.depot.DepotUtilisateurs;
import com.grfconsulting.adhesion.depot.DepotAdhesions;
import com.grfconsulting.adhesion.domaine.EtatAdhesion;
import com.grfconsulting.authentification.domaine.Utilisateur;
import com.grfconsulting.commun.exception.AccesInterditException;
import com.grfconsulting.commun.exception.RessourceIntrouvableException;

@Service
public class ServiceQuestionsJuridiquesImpl implements ServiceQuestionsJuridiques {

    private final DepotQuestionsJuridiques repository;
    private final ConvertisseurQuestionJuridique mapper;
    private final GenerateurReponseJuridique answerGenerator;
    private final DepotUtilisateurs depotUtilisateurs;
    private final DepotAdhesions depotAdhesions;

    public ServiceQuestionsJuridiquesImpl(DepotQuestionsJuridiques repository, ConvertisseurQuestionJuridique mapper,
                                    GenerateurReponseJuridique answerGenerator, DepotUtilisateurs depotUtilisateurs,
                                    DepotAdhesions depotAdhesions) {
        this.repository = repository;
        this.mapper = mapper;
        this.answerGenerator = answerGenerator;
        this.depotUtilisateurs = depotUtilisateurs;
        this.depotAdhesions = depotAdhesions;
    }

    @Override
    @Transactional
    public ReponseQuestionJuridique ask(DemandeQuestionJuridique request, UUID utilisateurId) {
        verifierAdhesionActive(utilisateurId);
        GenerateurReponseJuridique.ReponseGeneree generated = answerGenerator.generate(request.domain(), request.question().trim());
        Utilisateur utilisateur = depotUtilisateurs.findById(utilisateurId)
                .orElseThrow(() -> new AccesInterditException("Le compte membre est introuvable."));
        QuestionJuridique entity = new QuestionJuridique(request.domain(), request.question().trim(), "", "", utilisateur);
        entity.completeAnswer(generated.answer(), generated.sourceReferences());
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public ReponseQuestionJuridique getById(UUID id, UUID utilisateurId) {
        verifierAdhesionActive(utilisateurId);
        return repository.findByIdAndUtilisateurId(id, utilisateurId).map(mapper::toResponse)
                .orElseThrow(() -> new RessourceIntrouvableException("Question juridique introuvable."));
    }

    private void verifierAdhesionActive(UUID utilisateurId) {
        if (!depotAdhesions.existsByUtilisateurIdAndEtatAndExpireLeAfter(utilisateurId, EtatAdhesion.ACTIVE,
                java.time.Instant.now())) {
            throw new AccesInterditException("Une adhésion active est nécessaire pour cette fonctionnalité membre.");
        }
    }
}

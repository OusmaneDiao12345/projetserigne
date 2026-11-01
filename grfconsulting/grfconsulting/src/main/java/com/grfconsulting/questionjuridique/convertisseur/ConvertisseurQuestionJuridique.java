package com.grfconsulting.questionjuridique.convertisseur;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.grfconsulting.questionjuridique.domaine.QuestionJuridique;
import com.grfconsulting.questionjuridique.dto.DemandeQuestionJuridique;
import com.grfconsulting.questionjuridique.dto.ReponseQuestionJuridique;

@Mapper(componentModel = "spring")
public interface ConvertisseurQuestionJuridique {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "answer", constant = "")
    @Mapping(target = "sourceReferences", constant = "")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "utilisateur", ignore = true)
    QuestionJuridique toEntity(DemandeQuestionJuridique request);

    ReponseQuestionJuridique toResponse(QuestionJuridique entity);
}

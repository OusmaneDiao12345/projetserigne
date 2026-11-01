package com.grfconsulting.questionjuridique.service;

import com.grfconsulting.questionjuridique.domaine.DomaineJuridique;

public interface GenerateurReponseJuridique {
    ReponseGeneree generate(DomaineJuridique domain, String question);

    record ReponseGeneree(String answer, String sourceReferences) {
    }

}

package com.grfconsulting.paiement.shared;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;

import com.grfconsulting.commun.exception.ConflitMetierException;

/** Convertit les libellés opérateur en codes stables et refuse toute valeur inattendue. */
public final class ServiceNormalisationOperateur {
    private static final Set<String> CODES = Set.of("WAVE", "ORANGE_MONEY", "FREE_MONEY", "CHOIX_SUR_LA_CAISSE");
    private ServiceNormalisationOperateur() { }
    public static String normaliser(String valeur) {
        String code = Normalizer.normalize(valeur == null ? "" : valeur.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toUpperCase(Locale.ROOT).replaceAll("[ -]+", "_");
        if (code.equals("ORANGE") || code.equals("ORANGE_MONEY_SN")) code = "ORANGE_MONEY";
        if (code.equals("FREE") || code.equals("FREE_MONEY_SN")) code = "FREE_MONEY";
        if (code.equals("SANDBOX") || code.equals("AUTRE")) code = "CHOIX_SUR_LA_CAISSE";
        if (!CODES.contains(code)) throw new ConflitMetierException("Choisissez Wave, Orange Money, Free Money ou le choix depuis la caisse.");
        return code;
    }
}

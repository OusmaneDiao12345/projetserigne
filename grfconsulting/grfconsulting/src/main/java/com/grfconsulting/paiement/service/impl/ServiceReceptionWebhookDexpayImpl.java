package com.grfconsulting.paiement.service.impl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grfconsulting.adhesion.service.ServiceAdhesions;
import com.grfconsulting.paiement.configuration.ConfigurationPaiement;
import com.grfconsulting.paiement.depot.DepotPaiements;
import com.grfconsulting.paiement.domaine.EtatPaiement;
import com.grfconsulting.paiement.domaine.Paiement;
import com.grfconsulting.paiement.domaine.TypePaiement;
import com.grfconsulting.paiement.service.ServiceReceptionWebhookDexpay;
import com.grfconsulting.questionrapide.depot.DepotQuestionsInvitees;
import com.grfconsulting.commun.exception.PaiementIndisponibleException;
import com.grfconsulting.commun.exception.SignatureWebhookInvalideException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Vérifie le HMAC du corps reçu et applique une transition de paiement une seule fois. */
@Service
public class ServiceReceptionWebhookDexpayImpl implements ServiceReceptionWebhookDexpay {
    private final ConfigurationPaiement configuration;
    private final ObjectMapper objectMapper;
    private final DepotPaiements depotPaiements;
    private final ServiceAdhesions serviceAdhesions;
    private final DepotQuestionsInvitees depotQuestionsInvitees;

    public ServiceReceptionWebhookDexpayImpl(ConfigurationPaiement configuration, ObjectMapper objectMapper,
            DepotPaiements depotPaiements, ServiceAdhesions serviceAdhesions,
            DepotQuestionsInvitees depotQuestionsInvitees) {
        this.configuration = configuration; this.objectMapper = objectMapper;
        this.depotPaiements = depotPaiements; this.serviceAdhesions = serviceAdhesions;
        this.depotQuestionsInvitees = depotQuestionsInvitees;
    }

    @Override
    @Transactional
    public void traiter(byte[] corpsBrut, String signature) {
        verifierSignature(corpsBrut, signature);
        JsonNode evenement;
        try { evenement = objectMapper.readTree(corpsBrut); }
        catch (Exception exception) { throw new SignatureWebhookInvalideException("Corps de webhook DEXPAY illisible."); }
        String nomEvenement = premierTexte(evenement, "event", "type");
        JsonNode donnees = evenement.has("data") ? evenement.get("data")
                : evenement.has("payload") ? evenement.get("payload") : evenement;
        String reference = valeurRecursive(donnees, "reference", "merchant_reference", "merchantReference");
        if (reference == null) return;
        Paiement paiement = depotPaiements.findByReference(reference).orElse(null);
        if (paiement == null || paiement.getEtat() != EtatPaiement.EN_ATTENTE) return;

        verifierMontantEtDevise(donnees, paiement);
        if ("checkout.completed".equals(nomEvenement)) {
            paiement.confirmer(valeurRecursive(donnees, "transaction_id", "transactionId", "id"));
            depotPaiements.save(paiement);
            if (paiement.getType() == TypePaiement.ADHESION && paiement.getAdhesion() != null) {
                serviceAdhesions.activerApresPaiement(paiement.getAdhesion());
            }
            if (paiement.getType() == TypePaiement.QUESTION_RAPIDE && paiement.getQuestionInviteeId() != null) {
                depotQuestionsInvitees.findById(paiement.getQuestionInviteeId()).ifPresent(question -> {
                    question.confirmerPaiement(); depotQuestionsInvitees.save(question);
                });
            }
        } else if ("checkout.failed".equals(nomEvenement)) {
            paiement.marquerEchoue(); depotPaiements.save(paiement);
        } else if ("checkout.cancelled".equals(nomEvenement)) {
            paiement.marquerAnnule(); depotPaiements.save(paiement);
        }
    }

    private void verifierSignature(byte[] corpsBrut, String signature) {
        String secret = configuration.getCleSecrete();
        if (secret == null || secret.isBlank()) {
            throw new PaiementIndisponibleException("La clé secrète de webhook DEXPAY n'est pas configurée côté serveur.");
        }
        if (signature == null || signature.isBlank()) throw new SignatureWebhookInvalideException("Signature webhook absente.");
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] attendu = hmac.doFinal(corpsBrut);
            String valeur = signature.replaceFirst("(?i)^sha256=", "").trim();
            byte[] fourni = HexFormat.of().parseHex(valeur);
            if (!MessageDigest.isEqual(attendu, fourni)) throw new SignatureWebhookInvalideException("Signature webhook invalide.");
        } catch (IllegalArgumentException exception) {
            throw new SignatureWebhookInvalideException("Signature webhook invalide.");
        } catch (java.security.GeneralSecurityException exception) {
            throw new IllegalStateException("HMAC-SHA256 indisponible.", exception);
        }
    }

    private void verifierMontantEtDevise(JsonNode donnees, Paiement paiement) {
        String montant = valeurRecursive(donnees, "amount", "montant");
        String devise = valeurRecursive(donnees, "currency", "devise");
        if (montant != null && Long.parseLong(montant) != paiement.getMontant()) {
            throw new SignatureWebhookInvalideException("Le montant du webhook ne correspond pas au paiement attendu.");
        }
        if (devise != null && !paiement.getDevise().equalsIgnoreCase(devise)) {
            throw new SignatureWebhookInvalideException("La devise du webhook ne correspond pas au paiement attendu.");
        }
    }

    private String premierTexte(JsonNode node, String... champs) {
        for (String champ : champs) if (node.hasNonNull(champ)) return node.get(champ).asText();
        return null;
    }

    private String valeurRecursive(JsonNode node, String... noms) {
        if (node == null) return null;
        if (node.isObject()) {
            for (String nom : noms) if (node.hasNonNull(nom) && !node.get(nom).asText().isBlank()) return node.get(nom).asText();
            var champs = node.fields();
            while (champs.hasNext()) {
                String valeur = valeurRecursive(champs.next().getValue(), noms);
                if (valeur != null) return valeur;
            }
        } else if (node.isArray()) {
            for (JsonNode enfant : node) {
                String valeur = valeurRecursive(enfant, noms);
                if (valeur != null) return valeur;
            }
        }
        return null;
    }
}

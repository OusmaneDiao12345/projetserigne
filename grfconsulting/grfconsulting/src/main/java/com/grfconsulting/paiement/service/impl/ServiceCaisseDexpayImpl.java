package com.grfconsulting.paiement.service.impl;

import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.grfconsulting.paiement.configuration.ConfigurationPaiement;
import com.grfconsulting.paiement.service.ServiceCaisseDexpay;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

/** Crée côté serveur une session de paiement hébergée par DEXPAY. */
@Service
public class ServiceCaisseDexpayImpl implements ServiceCaisseDexpay {
    private final RestClient clientHttpPaiement;
    private final ConfigurationPaiement configuration;

    public ServiceCaisseDexpayImpl(RestClient clientHttpPaiement, ConfigurationPaiement configuration) {
        this.clientHttpPaiement = clientHttpPaiement;
        this.configuration = configuration;
    }

    @Override
    public String creerCaisse(String reference, String article, long montant) {
        verifierConfiguration();

        Map<String, Object> demande = new LinkedHashMap<>();
        demande.put("reference", reference);
        demande.put("item_name", article);
        demande.put("amount", montant);
        demande.put("currency", "XOF");
        demande.put("countryISO", "SN");
        demande.put("webhook_url", configuration.getUrlApiPublique() + configuration.getUrlWebhookPath());
        demande.put("success_url", configuration.getUrlFrontend() + "/paiement/confirmation");
        demande.put("failure_url", configuration.getUrlFrontend() + "/paiement/echec");

        try {
            JsonNode resultat = clientHttpPaiement.post()
                    .uri(configuration.getUrlApi().replaceAll("/$", "") + "/checkout-sessions")
                    .header("x-api-key", configuration.getCleApi())
                    .body(demande)
                    .retrieve()
                    .body(JsonNode.class);

            JsonNode urlPaiement = resultat == null ? null : resultat.get("payment_url");
            if (urlPaiement == null || !urlPaiement.isTextual() || urlPaiement.asText().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "DEXPAY n'a pas renvoyé l'adresse de paiement.");
            }
            return urlPaiement.asText();
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Impossible de créer la session de paiement DEXPAY.", exception);
        }
    }

    private void verifierConfiguration() {
        if (configuration.getUrlApi() == null || configuration.getUrlApi().isBlank()
                || configuration.getCleApi() == null || configuration.getCleApi().isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "La configuration DEXPAY est incomplète.");
        }
        if (configuration.getUrlApiPublique() == null || configuration.getUrlApiPublique().isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "PUBLIC_API_BASE_URL doit être une adresse HTTPS accessible par DEXPAY.");
        }
    }
}

package com.grfconsulting.paiement.controleur;

import com.grfconsulting.paiement.service.ServiceReceptionWebhookDexpay;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Point d'entrée public DEXPAY : le service vérifie la signature avant tout changement d'état. */
@RestController
@RequestMapping("/api/v1/paiements/webhook")
@Hidden
public class ControleurWebhookPaiement {
    private final ServiceReceptionWebhookDexpay service;
    public ControleurWebhookPaiement(ServiceReceptionWebhookDexpay service) { this.service = service; }

    @PostMapping("/dexpay")
    public ResponseEntity<AccuseReception> recevoir(@RequestBody byte[] corpsBrut,
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signature) {
        service.traiter(corpsBrut, signature);
        return ResponseEntity.ok(new AccuseReception(true));
    }

    public record AccuseReception(boolean received) { }
}

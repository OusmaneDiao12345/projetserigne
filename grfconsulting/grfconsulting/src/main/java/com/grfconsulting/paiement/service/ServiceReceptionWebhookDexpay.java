package com.grfconsulting.paiement.service;

public interface ServiceReceptionWebhookDexpay {
    void traiter(byte[] corpsBrut, String signature);
}

package com.grfconsulting.paiement.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Paramètres DEXPAY et adresses de retour. Les clés proviennent uniquement de l'environnement serveur. */
@ConfigurationProperties(prefix = "app.paiement")
public class ConfigurationPaiement {
    private String fournisseur;
    private String urlApi;
    private String cleApi;
    private String cleSecrete;
    private String urlApiPublique;
    private String urlFrontend;
    private String urlWebhookPath;

    public String getFournisseur() { return fournisseur; }
    public void setFournisseur(String fournisseur) { this.fournisseur = fournisseur; }
    public String getUrlApi() { return urlApi; }
    public void setUrlApi(String urlApi) { this.urlApi = urlApi; }
    public String getCleApi() { return cleApi; }
    public void setCleApi(String cleApi) { this.cleApi = cleApi; }
    public String getCleSecrete() { return cleSecrete; }
    public void setCleSecrete(String cleSecrete) { this.cleSecrete = cleSecrete; }
    public String getUrlApiPublique() { return urlApiPublique; }
    public void setUrlApiPublique(String urlApiPublique) { this.urlApiPublique = urlApiPublique; }
    public String getUrlFrontend() { return urlFrontend; }
    public void setUrlFrontend(String urlFrontend) { this.urlFrontend = urlFrontend; }
    public String getUrlWebhookPath() { return urlWebhookPath; }
    public void setUrlWebhookPath(String urlWebhookPath) { this.urlWebhookPath = urlWebhookPath; }
}

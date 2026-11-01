package com.grfconsulting.paiement.configuration;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Fournit les paramètres et le client HTTP partagé pour le fournisseur de paiement. */
@Configuration
@EnableConfigurationProperties(ConfigurationPaiement.class)
public class ConfigurationClientDexpay {
    @Bean
    RestClient clientHttpPaiement() {
        return RestClient.builder().build();
    }

    @Bean
    ObjectMapper lecteurJsonWebhook() {
        return new ObjectMapper();
    }
}

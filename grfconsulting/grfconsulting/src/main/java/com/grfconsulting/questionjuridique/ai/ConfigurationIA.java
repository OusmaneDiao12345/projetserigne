package com.grfconsulting.questionjuridique.ai;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.grfconsulting.questionjuridique.service.GenerateurReponseJuridique;
import com.grfconsulting.commun.exception.ServiceIAIndisponibleException;

@Configuration
public class ConfigurationIA {

    @Bean
    @ConditionalOnProperty(name = "app.ai.enabled", havingValue = "false", matchIfMissing = true)
    GenerateurReponseJuridique disabledGenerateurReponseJuridique() {
        return (domain, question) -> {
            throw new ServiceIAIndisponibleException("Le service IA n'est pas configuré. Activez AI_ENABLED et configurez la clé Gemini.");
        };
    }
}

package com.grfconsulting.commun.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class ConfigurationOpenAPI {

    @Bean
    OpenAPI grfConsultingOpenApi() {
        return new OpenAPI().info(new Info()
                .title("GRF Consulting API")
                .version("v1")
                .description("API du service juridique : comptes, adhésions, paiements et questions."))
                .components(new Components().addSecuritySchemes("jetonJWT", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("jetonJWT"));
    }
}

package com.grfconsulting.commun.config;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import com.grfconsulting.authentification.service.ServiceDetailsUtilisateur;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

/** Configure les mots de passe hachés, les jetons signés, les permissions et les routes publiques. */
@Configuration
@EnableMethodSecurity
public class ConfigurationSecurite {

    @Bean
    PasswordEncoder encodeurMotDePasse() { return new BCryptPasswordEncoder(12); }

    @Bean
    AuthenticationProvider fournisseurAuthentification(ServiceDetailsUtilisateur details, PasswordEncoder encodeur) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(details);
        provider.setPasswordEncoder(encodeur);
        return provider;
    }

    @Bean
    AuthenticationManager gestionnaireAuthentification(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    JwtEncoder encodeurJwt(@Value("${app.securite.jwt-secret}") String secret) {
        SecretKey key = creerCle(secret);
        return new NimbusJwtEncoder(new ImmutableSecret<>(key));
    }

    @Bean
    JwtDecoder decodeurJwt(@Value("${app.securite.jwt-secret}") String secret) {
        return NimbusJwtDecoder.withSecretKey(creerCle(secret)).macAlgorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    JwtAuthenticationConverter convertisseurAutoritesJwt() {
        JwtGrantedAuthoritiesConverter permissions = new JwtGrantedAuthoritiesConverter();
        permissions.setAuthoritiesClaimName("permissions");
        permissions.setAuthorityPrefix("");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            var authorities = new java.util.ArrayList<>(permissions.convert(jwt));
            Object roles = jwt.getClaims().get("roles");
            if (roles instanceof Iterable<?> codes) {
                for (Object code : codes) authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + code));
            }
            return authorities;
        });
        return converter;
    }

    @Bean
    @Order(1)
    SecurityFilterChain securiserRoutesAuthentificationPubliques(HttpSecurity http) throws Exception {
        return http.securityMatcher("/api/v1/auth/inscription", "/api/v1/auth/connexion")
                .csrf(csrf -> csrf.disable()).cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .build();
    }

//    @Bean
//    @Order(2)
//    SecurityFilterChain securiserApi(HttpSecurity http, JwtAuthenticationConverter converter) throws Exception {
//        return http.csrf(csrf -> csrf.disable()).cors(Customizer.withDefaults())
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/actuator/health/**").permitAll()
//                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/inscription", "/api/v1/auth/connexion").permitAll()
//                        .requestMatchers("/api/v1/paiements/webhook/dexpay").permitAll()
//                        .requestMatchers("/api/v1/paiements/*").permitAll()
//                        .requestMatchers("/api/v1/questions-rapides/paiements", "/api/v1/questions-rapides/*").permitAll()
//                        .requestMatchers("/api/v1/administration/**").hasRole("ADMINISTRATEUR")
//                        .requestMatchers("/api/v1/adhesions/**").hasRole("MEMBRE")
//                        .requestMatchers("/api/v1/legal-questions/**").hasAuthority("POSER_QUESTION")
//                        .requestMatchers("/api/v1/auth/moi").authenticated()
//                        .anyRequest().authenticated())
//                .oauth2ResourceServer(resource -> resource.jwt(jwt -> jwt.jwtAuthenticationConverter(converter)))
//                .build();
//    }

  @Bean
  @Order(2)
  SecurityFilterChain securiserApi(
    HttpSecurity http,
    JwtAuthenticationConverter converter,
    @Qualifier("configurationCors") CorsConfigurationSource corsSource
  ) throws Exception {
    return http
      .csrf(csrf -> csrf.disable())
      .cors(cors -> cors.configurationSource(corsSource))
      .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
          "/v3/api-docs/**", "/actuator/health/**").permitAll()
        .requestMatchers(HttpMethod.POST,
          "/api/v1/auth/inscription",
          "/api/v1/auth/connexion").permitAll()
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        .requestMatchers("/api/v1/paiements/webhook/dexpay").permitAll()
        .requestMatchers("/api/v1/paiements/*").permitAll()
        .requestMatchers("/api/v1/questions-rapides/paiements",
          "/api/v1/questions-rapides/*").permitAll()
        .requestMatchers("/api/v1/administration/**").hasRole("ADMINISTRATEUR")
        .requestMatchers("/api/v1/adhesions/**").hasRole("MEMBRE")
        .requestMatchers("/api/v1/legal-questions/**").hasAuthority("POSER_QUESTION")
        .requestMatchers("/api/v1/auth/moi").authenticated()
        .anyRequest().authenticated()
      )
      .oauth2ResourceServer(rs -> rs.jwt(jwt -> jwt.jwtAuthenticationConverter(converter)))
      .build();
  }

    @Bean
    CorsConfigurationSource configurationCors(@Value("${app.cors.allowed-origins}") String origins) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).filter(value -> !value.isBlank()).toList());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Content-Type", "Authorization", "X-Webhook-Signature"));
        configuration.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    private SecretKey creerCle(String secret) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET doit contenir au moins 32 octets.");
        }
        return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }
}

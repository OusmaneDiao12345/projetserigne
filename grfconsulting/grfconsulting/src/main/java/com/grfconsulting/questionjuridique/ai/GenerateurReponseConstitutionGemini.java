package com.grfconsulting.questionjuridique.ai;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.grfconsulting.questionjuridique.domaine.DomaineJuridique;
import com.grfconsulting.questionjuridique.service.GenerateurReponseJuridique;
import com.grfconsulting.commun.exception.ServiceIAIndisponibleException;

@Component
@ConditionalOnProperty(name = "app.ai.enabled", havingValue = "true")
public class GenerateurReponseConstitutionGemini implements GenerateurReponseJuridique {

    private static final String SYSTEM_INSTRUCTIONS = """
            Tu es un assistant d'information juridique pour le Sénégal. Réponds en français clair et concis.
            Base ta réponse uniquement sur les extraits fournis. Si les extraits ne suffisent pas, dis-le clairement
            et ne fabrique ni règle ni numéro d'article. Cite les numéros d'articles présents dans les extraits.
            Précise que l'information ne remplace pas un conseil personnalisé d'un professionnel du droit.
            Domaine de la question : {domain}
            Extraits vérifiés de la Constitution et des textes indexés :
            {context}
            """;

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public GenerateurReponseConstitutionGemini(ChatClient.Builder chatClientBuilder, VectorStore vectorStore) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
    }

    @Override
    public ReponseGeneree generate(DomaineJuridique domain, String question) {
        List<Document> matches = vectorStore.similaritySearch(SearchRequest.builder().query(question).topK(5).build());
        if (matches == null || matches.isEmpty()) {
            throw new ServiceIAIndisponibleException("La base documentaire juridique n'est pas encore indexée.");
        }

        String context = matches.stream().map(Document::getText).collect(Collectors.joining("\n\n---\n\n"));
        String references = matches.stream()
                .map(document -> document.getMetadata().get("article"))
                .filter(value -> value != null && !value.toString().isBlank())
                .map(Object::toString).distinct().collect(Collectors.joining(", "));
        String answer = chatClient.prompt()
                .system(SYSTEM_INSTRUCTIONS.replace("{domain}", domain.name()).replace("{context}", context))
                .user(question)
                .call()
                .content();
        if (answer == null || answer.isBlank()) {
            throw new ServiceIAIndisponibleException("Le fournisseur IA n'a pas retourné de réponse exploitable.");
        }
        return new ReponseGeneree(answer, references);
    }
}

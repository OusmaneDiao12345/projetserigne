package com.grfconsulting;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApplicationGrfConsultingTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void contextLoads() {
	}

	@Test
	void inscriptionIsPublicAndValidatesTheRequestBody() throws Exception {
		mockMvc.perform(post("/api/v1/auth/inscription")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
			.andExpect(status().isBadRequest());
	}

	@Test
	void inscriptionIgnoresAnExpiredBearerToken() throws Exception {
		mockMvc.perform(post("/api/v1/auth/inscription")
				.header("Authorization", "Bearer invalid-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
			.andExpect(status().isBadRequest());
	}

	@Test
	void inscriptionOpenApiDoesNotRequireJwt() throws Exception {
		MvcResult result = mockMvc.perform(get("/v3/api-docs"))
			.andExpect(status().isOk())
			.andReturn();
		JsonNode security = objectMapper.readTree(result.getResponse().getContentAsString())
			.at("/paths/~1api~1v1~1auth~1inscription/post/security");

		assertTrue(security.isMissingNode() || security.isEmpty());
	}

}

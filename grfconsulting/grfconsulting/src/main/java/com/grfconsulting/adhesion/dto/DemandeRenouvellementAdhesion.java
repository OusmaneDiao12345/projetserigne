package com.grfconsulting.adhesion.dto;

import jakarta.validation.constraints.NotBlank;
public record DemandeRenouvellementAdhesion(@NotBlank String operateur) { }

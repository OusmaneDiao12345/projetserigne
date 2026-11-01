package com.grfconsulting.adhesion.dto;

import java.time.Instant;
import java.util.UUID;
public record ReponseAdhesion(UUID id, String etat, Instant commenceLe, Instant expireLe) { }
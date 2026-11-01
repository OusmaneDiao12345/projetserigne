package com.grfconsulting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;

@SpringBootApplication
//@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class ApplicationGrfConsulting {

	public static void main(String[] args) {
		SpringApplication.run(ApplicationGrfConsulting.class, args);
	}

}

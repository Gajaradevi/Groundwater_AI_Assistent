package com.example.groundwater;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class GroundwaterApplication {

	public static void main(String[] args) {
		SpringApplication.run(GroundwaterApplication.class, args);
	}

    @RestController
    static class ChatController {

        @GetMapping("/hello")
        public String hello() {
            return "Hello, Groundwater Project Started!";
        }
    }
}

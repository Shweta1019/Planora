package com.planora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PlanorApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlanorApplication.class, args);
        
        System.out.println("-----------------------");
        System.out.println("Application Running");
        System.out.println("-----------------------");
    }
}

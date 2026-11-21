package com.uranusdata;

import org.springframework.boot.SpringApplication;

public class TestUranusdataApplication {

	public static void main(String[] args) {
		SpringApplication.from(UranusdataApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}

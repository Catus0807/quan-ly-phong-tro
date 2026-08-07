package com.thuctap.quanlyphongtro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling; 
@SpringBootApplication
@EnableScheduling // BẬT HẸN GIỜ
@EnableAsync
public class QuanlyphongtroApplication {

	// Chạy ứng dụng Spring Boot
	public static void main(String[] args) {
		SpringApplication.run(QuanlyphongtroApplication.class, args);
	}

}

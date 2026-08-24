package com.smartcart.order.feign;

import feign.Client;
import feign.RequestInterceptor;
import feign.okhttp.OkHttpClient;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {

    // =========================================================
    // FEIGN HTTP CLIENT
    // =========================================================

    @Bean
    public Client feignClient() {

        return new OkHttpClient();
    }

    // =========================================================
    // FORWARD JWT AUTHORIZATION HEADER
    // =========================================================

    @Bean
    public RequestInterceptor jwtRequestInterceptor() {

        return requestTemplate -> {

            ServletRequestAttributes attributes =
                    (ServletRequestAttributes)
                            RequestContextHolder.getRequestAttributes();

            if (attributes == null) {
                return;
            }

            HttpServletRequest request =
                    attributes.getRequest();

            String authorizationHeader =
                    request.getHeader("Authorization");

            if (authorizationHeader != null &&
                    !authorizationHeader.trim().isEmpty()) {

                requestTemplate.header(
                        "Authorization",
                        authorizationHeader
                );
            }
        };
    }
}
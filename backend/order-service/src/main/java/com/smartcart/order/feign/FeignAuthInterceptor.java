package com.smartcart.order.feign;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class FeignAuthInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {

        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {

            HttpServletRequest request =
                    attributes.getRequest();

            String authorizationHeader =
                    request.getHeader("Authorization");

            if (authorizationHeader != null
                    && authorizationHeader.startsWith("Bearer ")) {

                template.header(
                        "Authorization",
                        authorizationHeader
                );
            }
        }
    }
}
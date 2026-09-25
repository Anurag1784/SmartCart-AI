package com.smartcart.payment.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    // Reads the Razorpay Key ID from application.properties.
    @Value("${razorpay.key.id}")
    private String keyId;

    // Reads the Razorpay Key Secret from application.properties.
    // This value stays inside the backend and is never sent to the frontend.
    @Value("${razorpay.key.secret}")
    private String keySecret;

    // Creates one reusable RazorpayClient object for the Payment Service.
    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {

        // RazorpayClient uses the Key ID and Key Secret
        // to authenticate requests made from our backend to Razorpay.
        return new RazorpayClient(keyId, keySecret);
    }
}
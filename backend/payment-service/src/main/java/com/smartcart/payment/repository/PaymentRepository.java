package com.smartcart.payment.repository;

import com.smartcart.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Finds a SmartCart payment using our internal Order ID.
    Optional<Payment> findByOrderId(Long orderId);

    // Finds a SmartCart payment using the Razorpay Order ID.
    // This is required when Razorpay sends the payment response
    // back to our frontend for backend verification.
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);
}
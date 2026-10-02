package com.smartcart.payment.repository;

import com.smartcart.payment.entity.Payment;
import com.smartcart.payment.enums.PaymentStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Finds a SmartCart payment using our internal Order ID.
    Optional<Payment> findByOrderId(Long orderId);

    // Finds a SmartCart payment using the Razorpay Order ID.
    // This is required when Razorpay sends the payment response
    // back to our frontend for backend verification.
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

    // =========================================================
    // ADMIN - PAYMENT STATISTICS
    // =========================================================

    // Counts payments having the given payment status.
    long countByPaymentStatus(PaymentStatus paymentStatus);

    // Calculates the total amount for payments having
    // the given payment status.
    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM Payment p
            WHERE p.paymentStatus = :paymentStatus
            """)
    BigDecimal sumAmountByPaymentStatus(
            PaymentStatus paymentStatus
    );
    
}
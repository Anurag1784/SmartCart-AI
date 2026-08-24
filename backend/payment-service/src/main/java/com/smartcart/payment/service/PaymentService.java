package com.smartcart.payment.service;

import com.smartcart.payment.client.OrderClient;
import com.smartcart.payment.dto.PaymentRequest;
import com.smartcart.payment.dto.PaymentResponse;
import com.smartcart.payment.entity.Payment;
import com.smartcart.payment.enums.PaymentStatus;
import com.smartcart.payment.repository.PaymentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderClient orderClient) {

        this.paymentRepository = paymentRepository;
        this.orderClient = orderClient;
    }

    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    @Transactional
    public PaymentResponse createPayment(
            PaymentRequest request) {

        // =====================================================
        // CHECK FOR DUPLICATE PAYMENT
        // =====================================================

        if (paymentRepository
                .findByOrderId(request.getOrderId())
                .isPresent()) {

            throw new IllegalStateException(
                    "Payment already exists for order ID: "
                            + request.getOrderId()
            );
        }

        // =====================================================
        // CREATE PAYMENT
        // =====================================================

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .customerId(request.getCustomerId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        Payment savedPayment =
                paymentRepository.save(payment);

        return mapToResponse(savedPayment);
    }

    // =========================================================
    // PROCESS PAYMENT
    // =========================================================

    @Transactional
    public PaymentResponse processPayment(
            Long paymentId,
            boolean paymentSuccessful) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Payment not found with ID: "
                                                + paymentId
                                )
                        );

        // =====================================================
        // PAYMENT MUST BE PENDING
        // =====================================================

        if (payment.getPaymentStatus()
                != PaymentStatus.PENDING) {

            throw new IllegalStateException(
                    "Payment cannot be processed because current status is: "
                            + payment.getPaymentStatus()
            );
        }

        // =====================================================
        // SIMULATE PAYMENT GATEWAY
        // =====================================================

        if (paymentSuccessful) {

            payment.setPaymentStatus(
                    PaymentStatus.SUCCESS
            );

            payment.setGatewayOrderId(
                    "SIM_ORDER_" + payment.getPaymentId()
            );

            payment.setGatewayPaymentId(
                    "SIM_PAYMENT_" + payment.getPaymentId()
            );

            payment.setFailureReason(null);

        } else {

            payment.setPaymentStatus(
                    PaymentStatus.FAILED
            );

            payment.setFailureReason(
                    "Simulated payment failure"
            );
        }

        // =====================================================
        // SAVE PAYMENT
        // =====================================================

        Payment updatedPayment =
                paymentRepository.save(payment);

        // =====================================================
        // UPDATE ORDER SERVICE
        // =====================================================

        orderClient.updatePaymentStatus(
                payment.getOrderId(),
                payment.getPaymentStatus().name()
        );

        return mapToResponse(updatedPayment);
    }

    // =========================================================
    // REFUND PAYMENT
    // =========================================================

    @Transactional
    public PaymentResponse refundPayment(
            Long paymentId) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Payment not found with ID: "
                                                + paymentId
                                )
                        );

        // =====================================================
        // ONLY SUCCESSFUL PAYMENTS CAN BE REFUNDED
        // =====================================================

        if (payment.getPaymentStatus()
                != PaymentStatus.SUCCESS) {

            throw new IllegalStateException(
                    "Only successful payments can be refunded"
            );
        }

        // =====================================================
        // UPDATE PAYMENT STATUS
        // =====================================================

        payment.setPaymentStatus(
                PaymentStatus.REFUNDED
        );

        Payment refundedPayment =
                paymentRepository.save(payment);

        // =====================================================
        // UPDATE ORDER SERVICE
        // =====================================================

        orderClient.updatePaymentStatus(
                payment.getOrderId(),
                PaymentStatus.REFUNDED.name()
        );

        return mapToResponse(refundedPayment);
    }

    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(
            Long paymentId) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Payment not found with ID: "
                                                + paymentId
                                )
                        );

        return mapToResponse(payment);
    }

    // =========================================================
    // GET PAYMENT BY ORDER ID
    // =========================================================

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(
            Long orderId) {

        Payment payment =
                paymentRepository.findByOrderId(orderId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Payment not found for order ID: "
                                                + orderId
                                )
                        );

        return mapToResponse(payment);
    }

    // =========================================================
    // MAP ENTITY TO RESPONSE
    // =========================================================

    private PaymentResponse mapToResponse(
            Payment payment) {

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .orderId(payment.getOrderId())
                .customerId(payment.getCustomerId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .gatewayOrderId(payment.getGatewayOrderId())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .paymentStatus(payment.getPaymentStatus())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
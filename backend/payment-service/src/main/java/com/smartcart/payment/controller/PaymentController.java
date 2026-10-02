package com.smartcart.payment.controller;

import com.smartcart.payment.dto.PaymentRequest;
import com.smartcart.payment.dto.PaymentResponse;
import com.smartcart.payment.service.PaymentService;

import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }

    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest request) {

        PaymentResponse response =
                paymentService.createPayment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================================

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyRazorpayPayment(
            @RequestParam("razorpay_order_id")
            String razorpayOrderId,

            @RequestParam("razorpay_payment_id")
            String razorpayPaymentId,

            @RequestParam("razorpay_signature")
            String razorpaySignature) {

        PaymentResponse response =
                paymentService.verifyRazorpayPayment(
                        razorpayOrderId,
                        razorpayPaymentId,
                        razorpaySignature
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // PROCESS PAYMENT
    // =========================================================

    @PostMapping("/{paymentId}/process")
    public ResponseEntity<PaymentResponse> processPayment(
            @PathVariable Long paymentId,
            @RequestParam boolean success) {

        return ResponseEntity.ok(
                paymentService.processPayment(
                        paymentId,
                        success
                )
        );
    }

    // =========================================================
    // REFUND PAYMENT
    // =========================================================

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(
            @PathVariable Long paymentId) {

        return ResponseEntity.ok(
                paymentService.refundPayment(paymentId)
        );
    }

    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long paymentId) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(paymentId)
        );
    }

    // =========================================================
    // GET PAYMENT BY ORDER ID
    // =========================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentService.getPaymentByOrderId(orderId)
        );
    }
    
    // =========================================================
    // ADMIN - PAYMENT STATISTICS
    // =========================================================

    @GetMapping("/count")
    public ResponseEntity<Long> getSuccessfulPaymentCount() {

        return ResponseEntity.ok(
                paymentService.countSuccessfulPayments()
        );
    }

    @GetMapping("/revenue")
    public ResponseEntity<BigDecimal> getTotalRevenue() {

        return ResponseEntity.ok(
                paymentService.getTotalRevenue()
        );
    }
    
 // =========================================================
 // ADMIN - GET ALL PAYMENTS
 // =========================================================

   @GetMapping
   public ResponseEntity<List<PaymentResponse>> getAllPayments() {

     return ResponseEntity.ok(
             paymentService.getAllPayments()
     );
   }
}
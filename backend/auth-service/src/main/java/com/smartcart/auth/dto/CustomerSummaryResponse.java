package com.smartcart.auth.dto;

public class CustomerSummaryResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    public CustomerSummaryResponse(
            Long userId,
            String firstName,
            String lastName,
            String email,
            String phone) {

        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }
}
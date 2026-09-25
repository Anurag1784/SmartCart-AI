package com.smartcart.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcart.auth.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {

    // Finds a role using its name, for example CUSTOMER or SELLER.
    // IgnoreCase means "seller", "SELLER", and "Seller" will all work.
    Role findByRoleNameIgnoreCase(String roleName);
}
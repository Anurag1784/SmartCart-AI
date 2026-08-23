package com.smartcart.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcart.auth.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {

}
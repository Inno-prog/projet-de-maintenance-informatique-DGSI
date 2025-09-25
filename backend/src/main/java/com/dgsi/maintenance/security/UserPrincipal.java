package com.dgsi.maintenance.security;

import com.dgsi.maintenance.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {
    private String id;
    private String nom;
    private String email;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(String id, String nom, String email, String password, 
                        Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole())
        );

        return new UserPrincipal(
            user.getId(),
            user.getNom(),
            user.getEmail(),
            user.getPassword(),
            authorities
        );
    }

    public String getId() { return id; }
    public String getNom() { return nom; }

    @Override
    public String getUsername() { return email; }
    public String getEmail() { return email; }

    @Override
    public String getPassword() { return password; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
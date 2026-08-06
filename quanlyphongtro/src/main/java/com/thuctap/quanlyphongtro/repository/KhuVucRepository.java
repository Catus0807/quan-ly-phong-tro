package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.KhuVuc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KhuVucRepository extends JpaRepository<KhuVuc, Long> {
    List<KhuVuc> findByChuTroId(Long chuTroId);
}
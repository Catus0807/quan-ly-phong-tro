package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.HoSoThue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HoSoThueRepository extends JpaRepository<HoSoThue, Long> {
    List<HoSoThue> findByChuTroIdOrderByNamDesc(Long chuTroId);
    Optional<HoSoThue> findByChuTroIdAndNam(Long chuTroId, int nam);
}
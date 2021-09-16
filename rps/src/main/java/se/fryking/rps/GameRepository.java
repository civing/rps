package se.fryking.rps;

import org.springframework.data.jpa.repository.JpaRepository;

interface GameRepository extends JpaRepository<Game, Long> {
}

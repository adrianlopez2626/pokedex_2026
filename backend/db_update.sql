-- 1. Tablas en la base de datos "pokedex_2026" (o "pokemon" según su configuración)
-- Asegúrese de usar la base de datos correcta
USE pokedex_2026;

-- Tabla de entrenadores
CREATE TABLE IF NOT EXISTS entrenadores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación Pokémon - Entrenador (capturas)
CREATE TABLE IF NOT EXISTS capturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entrenador_id INT NOT NULL,
    pokemon_id INT(10) UNSIGNED ZEROFILL NOT NULL,
    nivel_actual INT NOT NULL,
    experiencia INT DEFAULT 0,
    ubicacion ENUM('equipo', 'caja') DEFAULT 'equipo',
    fecha_captura DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id) ON DELETE CASCADE,
    FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE,
    UNIQUE KEY unique_captura (entrenador_id, pokemon_id)
);

-- Tabla de evoluciones
CREATE TABLE IF NOT EXISTS evoluciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pokemon_origen_id INT(10) UNSIGNED ZEROFILL NOT NULL,
    pokemon_destino_id INT(10) UNSIGNED ZEROFILL NOT NULL,
    nivel_requerido INT NOT NULL,
    FOREIGN KEY (pokemon_origen_id) REFERENCES pokemon(id),
    FOREIGN KEY (pokemon_destino_id) REFERENCES pokemon(id)
);

-- Insertar entrenadores de ejemplo
INSERT INTO entrenadores (nombre) VALUES ('Ash'), ('Misty'), ('Brock'), ('Red'), ('Blue') 
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar evoluciones de ejemplo (se asume que existen los pokemon con estos ids)
INSERT IGNORE INTO evoluciones (pokemon_origen_id, pokemon_destino_id, nivel_requerido) VALUES
(1, 2, 16), (2, 3, 32), (4, 5, 16), (5, 6, 36), (7, 8, 16), (8, 9, 36), (25, 26, 30);

-- VISTA Salón de la Fama
CREATE OR REPLACE VIEW vista_top_competitivo AS
SELECT id, nombre, tipo_principal, (ataque + defensa + velocidad) AS total_stats
FROM pokemon ORDER BY total_stats DESC LIMIT 10;

-- ÍNDICE para búsquedas rápidas
-- Ignoramos si ya existe con un bloque condicional o simplemente lo creamos.
-- CREATE INDEX idx_pokemon_nombre ON pokemon(nombre);
-- MySQL no tiene un IF NOT EXISTS simple para índices, así que puede dar error si ya existe.
-- Si hay error, comente la siguiente línea:
CREATE INDEX idx_pokemon_nombre ON pokemon(nombre);

-- 3. Script para insertar 1000+ Pokémon de prueba
DELIMITER $$
CREATE PROCEDURE InsertarPokemonsMasivo()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 1000 DO
        INSERT IGNORE INTO pokemon (nombre, tipo_principal, nivel, ataque, defensa, velocidad)
        VALUES (
            CONCAT('MewClone_', i), 
            'Psiquico', 
            FLOOR(1 + RAND() * 100), 
            FLOOR(10 + RAND() * 100), 
            FLOOR(10 + RAND() * 100), 
            FLOOR(10 + RAND() * 100)
        );
        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;

CALL InsertarPokemonsMasivo();

-- Opcional: Eliminar el procedimiento si ya no se necesita
DROP PROCEDURE InsertarPokemonsMasivo;

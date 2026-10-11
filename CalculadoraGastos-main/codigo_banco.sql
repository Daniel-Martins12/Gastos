CREATE DATABASE IF NOT EXISTS controle;


USE controle;

CREATE TABLE despesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(150) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tipo INT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    data DATE NULL,

    CONSTRAINT chk_despesas_valor
        CHECK (valor > 0),

    CONSTRAINT chk_despesas_tipo
        CHECK (tipo IN (0, 1))
);

USE controle;

SELECT * FROM despesas;

SELECT @@hostname AS servidor, @@port AS porta, DATABASE() AS banco;

USE controle;

SELECT COUNT(*) AS total FROM despesas;

SELECT * FROM despesas;
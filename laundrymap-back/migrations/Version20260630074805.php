<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260630074805 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE lien (id INT AUTO_INCREMENT NOT NULL, url VARCHAR(255) NOT NULL, texte_alternatif VARCHAR(255) NOT NULL, social_media VARCHAR(255) NOT NULL, is_public TINYINT NOT NULL, laverie_id_id INT DEFAULT NULL, INDEX IDX_A532B4B58552B22D (laverie_id_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE lien ADD CONSTRAINT FK_A532B4B58552B22D FOREIGN KEY (laverie_id_id) REFERENCES laverie (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE lien DROP FOREIGN KEY FK_A532B4B58552B22D');
        $this->addSql('DROP TABLE lien');
    }
}

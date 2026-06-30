<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260630075403 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE lien DROP FOREIGN KEY `FK_A532B4B58552B22D`');
        $this->addSql('DROP INDEX IDX_A532B4B58552B22D ON lien');
        $this->addSql('ALTER TABLE lien CHANGE laverie_id_id laverie_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE lien ADD CONSTRAINT FK_A532B4B597C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('CREATE INDEX IDX_A532B4B597C840DF ON lien (laverie_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE lien DROP FOREIGN KEY FK_A532B4B597C840DF');
        $this->addSql('DROP INDEX IDX_A532B4B597C840DF ON lien');
        $this->addSql('ALTER TABLE lien CHANGE laverie_id laverie_id_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE lien ADD CONSTRAINT `FK_A532B4B58552B22D` FOREIGN KEY (laverie_id_id) REFERENCES laverie (id)');
        $this->addSql('CREATE INDEX IDX_A532B4B58552B22D ON lien (laverie_id_id)');
    }
}

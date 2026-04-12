<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260412070949 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie DROP FOREIGN KEY `FK_B62ACE49F98F144A`');
        $this->addSql('ALTER TABLE laverie ADD CONSTRAINT FK_B62ACE49F98F144A FOREIGN KEY (logo_id) REFERENCES media (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie DROP FOREIGN KEY FK_B62ACE49F98F144A');
        $this->addSql('ALTER TABLE laverie ADD CONSTRAINT `FK_B62ACE49F98F144A` FOREIGN KEY (logo_id) REFERENCES media (id)');
    }
}

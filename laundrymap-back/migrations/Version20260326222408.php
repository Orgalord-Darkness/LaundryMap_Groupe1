<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260326222408 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie_note ADD CONSTRAINT FK_D6ACE30A97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE laverie_note ADD CONSTRAINT FK_D6ACE30AFB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('CREATE INDEX IDX_D6ACE30A97C840DF ON laverie_note (laverie_id)');
        $this->addSql('CREATE INDEX IDX_D6ACE30AFB88E14F ON laverie_note (utilisateur_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie_note DROP FOREIGN KEY FK_D6ACE30A97C840DF');
        $this->addSql('ALTER TABLE laverie_note DROP FOREIGN KEY FK_D6ACE30AFB88E14F');
        $this->addSql('DROP INDEX IDX_D6ACE30A97C840DF ON laverie_note');
        $this->addSql('DROP INDEX IDX_D6ACE30AFB88E14F ON laverie_note');
    }
}

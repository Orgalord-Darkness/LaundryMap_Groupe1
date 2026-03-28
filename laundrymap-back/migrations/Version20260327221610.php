<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260327221610 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie_fermeture_exceptionnelle ADD CONSTRAINT FK_99A98E2D97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('CREATE INDEX IDX_99A98E2D97C840DF ON laverie_fermeture_exceptionnelle (laverie_id)');
        $this->addSql('ALTER TABLE laverie_historique_interaction CHANGE action action VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie_fermeture_exceptionnelle DROP FOREIGN KEY FK_99A98E2D97C840DF');
        $this->addSql('DROP INDEX IDX_99A98E2D97C840DF ON laverie_fermeture_exceptionnelle');
        $this->addSql('ALTER TABLE laverie_historique_interaction CHANGE action action VARCHAR(50) NOT NULL');
    }
}

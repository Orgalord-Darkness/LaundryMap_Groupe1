<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260327183239 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie_equipement ADD CONSTRAINT FK_17CAF8EE97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('CREATE INDEX IDX_17CAF8EE97C840DF ON laverie_equipement (laverie_id)');
        $this->addSql('ALTER TABLE laverie_fermeture ADD CONSTRAINT FK_2DA7259E97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('CREATE INDEX IDX_2DA7259E97C840DF ON laverie_fermeture (laverie_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie_equipement DROP FOREIGN KEY FK_17CAF8EE97C840DF');
        $this->addSql('DROP INDEX IDX_17CAF8EE97C840DF ON laverie_equipement');
        $this->addSql('ALTER TABLE laverie_fermeture DROP FOREIGN KEY FK_2DA7259E97C840DF');
        $this->addSql('DROP INDEX IDX_2DA7259E97C840DF ON laverie_fermeture');
    }
}

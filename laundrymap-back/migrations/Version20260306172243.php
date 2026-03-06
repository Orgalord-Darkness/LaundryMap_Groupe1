<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260306172243 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY `FK_7A28C10F1004EF61`');
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY `FK_7A28C10FB981C689`');
        $this->addSql('DROP INDEX IDX_7A28C10FB981C689 ON professionnel');
        $this->addSql('DROP INDEX IDX_7A28C10F1004EF61 ON professionnel');
        $this->addSql('ALTER TABLE professionnel ADD utilisateur_id INT NOT NULL, ADD adresse_id INT NOT NULL, DROP utilisateur_id_id, DROP adresse_id_id');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT FK_7A28C10FFB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT FK_7A28C10F4DE7DC5C FOREIGN KEY (adresse_id) REFERENCES adresse (id)');
        $this->addSql('CREATE INDEX IDX_7A28C10FFB88E14F ON professionnel (utilisateur_id)');
        $this->addSql('CREATE INDEX IDX_7A28C10F4DE7DC5C ON professionnel (adresse_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY FK_7A28C10FFB88E14F');
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY FK_7A28C10F4DE7DC5C');
        $this->addSql('DROP INDEX IDX_7A28C10FFB88E14F ON professionnel');
        $this->addSql('DROP INDEX IDX_7A28C10F4DE7DC5C ON professionnel');
        $this->addSql('ALTER TABLE professionnel ADD utilisateur_id_id INT NOT NULL, ADD adresse_id_id INT NOT NULL, DROP utilisateur_id, DROP adresse_id');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT `FK_7A28C10F1004EF61` FOREIGN KEY (adresse_id_id) REFERENCES adresse (id)');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT `FK_7A28C10FB981C689` FOREIGN KEY (utilisateur_id_id) REFERENCES utilisateur (id)');
        $this->addSql('CREATE INDEX IDX_7A28C10FB981C689 ON professionnel (utilisateur_id_id)');
        $this->addSql('CREATE INDEX IDX_7A28C10F1004EF61 ON professionnel (adresse_id_id)');
    }
}

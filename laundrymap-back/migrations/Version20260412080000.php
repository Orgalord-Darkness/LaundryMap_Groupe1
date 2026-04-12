<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260412080000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Change wi_line_reference from INT to VARCHAR(50) pour stocker le numéro de série Wi-Line';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE laverie CHANGE wi_line_reference wi_line_reference VARCHAR(50) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE laverie CHANGE wi_line_reference wi_line_reference INT DEFAULT NULL');
    }
}

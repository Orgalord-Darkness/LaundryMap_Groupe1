<?php 

namespace App\Command; 

use App\Repository\UtilisateurRepository;
use App\Enum\StatutEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Attribute\AsCommand;

#[AsCommand(
    name: 'app:lift-expired-blocks',
    description: 'Lève les blocages expirés des utilisateurs.',
)]
class LiftExpiredBlocksCommand extends Command  
{
    public function __construct(
        private UtilisateurRepository $utilisateurRepository,
        private EntityManagerInterface $entityManager,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $expiredUsers = $this->utilisateurRepository->findExpiredBans();

        foreach ($expiredUsers as $user) {
            $user->setStatut(StatutEnum::VALIDE);
            $user->setBlockedUntil(null);
            $this->entityManager->persist($user);
            $output->writeln(sprintf('Blocage levé pour l\'utilisateur ID %d', $user->getId()));
        }

        $this->entityManager->flush();

        $output->writeln(sprintf('%d blocage(s) levé(s).', count($expiredUsers)));

        return Command::SUCCESS;
    }
}
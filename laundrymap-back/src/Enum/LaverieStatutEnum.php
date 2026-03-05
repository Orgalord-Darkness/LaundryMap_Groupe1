<?php 

namespace App\Enum; 

enum LaverieStatutEnum: string {
    case EN_ATTENTE = 'en attente'; 
    case VALIDE = 'validé'; 
    case REFUSE = 'refusé';
}
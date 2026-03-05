<?php 

namespace App\Enum; 

enum StatutEnum: string {
    case EN_ATTENTE = 'en attente'; 
    case VALIDE = 'validé'; 
    case REFUSE = 'refusé';  
    case BANNI = 'banni'; 
}
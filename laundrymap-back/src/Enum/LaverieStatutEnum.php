<?php 

namespace App\Enum; 

enum LaverieStatutEnum: string {
    case EN_ATTENTE = 'EN_ATTENTE'; 
    case VALIDE = 'VALIDE'; 
    case REFUSE = 'REFUSE';
    case SUPPRIME = 'SUPPRIME'; 
}
<?php 

namespace App\Enum; 

enum GeoStatutEnum: string {
    case EN_ATTENTE = 'en attente'; 
    case GEOLOCALISE = 'géolocalisé'; 
    case ERREUR = 'géolocalisation erreur';
}
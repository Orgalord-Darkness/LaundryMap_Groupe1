<?php 

namespace App\Enum; 

enum RoleEnum: string {

    case USER = 'utilisateur';

    case PRO = 'professionnel';
    
    case ADMIN = 'administrateur';

}
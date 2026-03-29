<?php 

namespace App\Enum; 

enum RoleEnum: string {

    case USER = 'ROLE_USER';

    case PRO = 'ROLE_PRO';
    
    case ADMIN = 'ROLE_ADMIN';

}
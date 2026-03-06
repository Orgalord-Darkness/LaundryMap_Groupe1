<?php 

namespace App\Enum; 

enum MotifEnum: string {

    case PROPOS_INJURIEUX = 'propos injurieux' ;
    
    case SPAM = 'spam';

    case PUBLICITE = 'publicité non sollicité'; 

}
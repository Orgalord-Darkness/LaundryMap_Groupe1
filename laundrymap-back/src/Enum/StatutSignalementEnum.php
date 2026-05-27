<?php

namespace App\Enum;

enum StatutSignalementEnum: string
{
    case PENDING  = 'PENDING';
    case REVIEWED = 'REVIEWED';
}

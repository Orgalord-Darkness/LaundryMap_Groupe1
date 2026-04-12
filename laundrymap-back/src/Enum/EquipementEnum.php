<?php

namespace App\Enum;

enum EquipementEnum: string {
    case AUTRE = 'autre'; 
    // ─── Machines ────────────────────────────────
    case MACHINE_A_LAVER      = 'machine_a_laver';
    case SECHE_LINGE          = 'seche_linge';

    // ─── Équipements de confort ───────────────────
    case WIFI                 = 'wifi';
    case PARKING              = 'parking';
    case BANC                 = 'banc';
    case DISTRIBUTEUR_LESSIVE = 'distributeur_de_lessive'; // ✅ typo corrigée
}

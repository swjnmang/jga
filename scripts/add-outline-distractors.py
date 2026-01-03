#!/usr/bin/env python3
"""
Add distractors to all 233 country outline cards.
Strategy: Geographic neighbors, regional similarity, shape similarity
"""

import json
import re
from pathlib import Path

# Geographic regions and neighbor relationships
REGIONS = {
    # Europe
    'europe': {
        'de': {'neighbors': ['fr', 'pl', 'nl', 'at', 'ch', 'dk', 'cz', 'be'], 'region': ['gb', 'it', 'es']},
        'fr': {'neighbors': ['de', 'es', 'it', 'be', 'ch'], 'region': ['gb', 'nl', 'pt']},
        'gb': {'neighbors': ['ie', 'fr', 'nl', 'be'], 'region': ['de', 'es', 'dk']},
        'it': {'neighbors': ['fr', 'at', 'ch', 'si', 'hr'], 'region': ['gr', 'es', 'pt']},
        'es': {'neighbors': ['fr', 'pt', 'ad'], 'region': ['it', 'gr', 'ma']},
        'pt': {'neighbors': ['es'], 'region': ['fr', 'it', 'gr']},
        'nl': {'neighbors': ['de', 'be'], 'region': ['gb', 'dk', 'lu']},
        'be': {'neighbors': ['fr', 'de', 'nl', 'lu'], 'region': ['ch', 'at']},
        'ch': {'neighbors': ['de', 'fr', 'it', 'at', 'li'], 'region': ['lu', 'si']},
        'at': {'neighbors': ['de', 'ch', 'it', 'si', 'cz', 'sk', 'hu'], 'region': ['pl', 'hr']},
        'pl': {'neighbors': ['de', 'cz', 'sk', 'by', 'lt', 'ua'], 'region': ['ru', 'ro', 'hu']},
        'cz': {'neighbors': ['de', 'pl', 'at', 'sk'], 'region': ['hu', 'si']},
        'sk': {'neighbors': ['cz', 'pl', 'at', 'hu', 'ua'], 'region': ['ro', 'si']},
        'hu': {'neighbors': ['at', 'sk', 'ua', 'ro', 'rs', 'hr', 'si'], 'region': ['pl', 'bg']},
        'ro': {'neighbors': ['hu', 'rs', 'bg', 'ua', 'md'], 'region': ['pl', 'gr']},
        'bg': {'neighbors': ['ro', 'rs', 'mk', 'gr', 'tr'], 'region': ['hu', 'ua']},
        'gr': {'neighbors': ['al', 'mk', 'bg', 'tr'], 'region': ['it', 'cy', 'hr']},
        'al': {'neighbors': ['gr', 'mk', 'me', 'rs'], 'region': ['bg', 'ba']},
        'hr': {'neighbors': ['si', 'hu', 'rs', 'ba', 'me'], 'region': ['it', 'at']},
        'si': {'neighbors': ['at', 'it', 'hr', 'hu'], 'region': ['sk', 'ch']},
        'ba': {'neighbors': ['hr', 'rs', 'me'], 'region': ['al', 'mk', 'ro']},
        'rs': {'neighbors': ['hu', 'ro', 'bg', 'mk', 'al', 'me', 'ba', 'hr'], 'region': ['gr', 'sk']},
        'me': {'neighbors': ['al', 'ba', 'rs', 'hr'], 'region': ['mk', 'si']},
        'mk': {'neighbors': ['al', 'gr', 'bg', 'rs'], 'region': ['me', 'ba']},
        'dk': {'neighbors': ['de'], 'region': ['se', 'no', 'nl']},
        'se': {'neighbors': ['no', 'fi'], 'region': ['dk', 'ee', 'lt']},
        'no': {'neighbors': ['se', 'fi', 'ru'], 'region': ['dk', 'is']},
        'fi': {'neighbors': ['se', 'no', 'ru', 'ee'], 'region': ['lt', 'lv']},
        'ee': {'neighbors': ['fi', 'lv', 'ru'], 'region': ['lt', 'se']},
        'lv': {'neighbors': ['ee', 'lt', 'ru', 'by'], 'region': ['pl', 'fi']},
        'lt': {'neighbors': ['lv', 'by', 'pl', 'ru'], 'region': ['ee', 'ua']},
        'by': {'neighbors': ['lt', 'lv', 'ru', 'ua', 'pl'], 'region': ['ro', 'sk']},
        'ua': {'neighbors': ['by', 'ru', 'pl', 'sk', 'hu', 'ro', 'md'], 'region': ['bg', 'tr']},
        'md': {'neighbors': ['ro', 'ua'], 'region': ['by', 'bg', 'hu']},
        'ru': {'neighbors': ['no', 'fi', 'ee', 'lv', 'lt', 'by', 'ua'], 'region': ['kz', 'ge', 'az']},
        'is': {'neighbors': [], 'region': ['no', 'ie', 'gb']},
        'ie': {'neighbors': ['gb'], 'region': ['is', 'fr', 'es']},
        'lu': {'neighbors': ['be', 'de', 'fr'], 'region': ['nl', 'ch']},
        'ad': {'neighbors': ['es', 'fr'], 'region': ['pt', 'it']},
        'mc': {'neighbors': ['fr'], 'region': ['it', 'ch', 'li']},
        'li': {'neighbors': ['ch', 'at'], 'region': ['de', 'it']},
        'sm': {'neighbors': ['it'], 'region': ['ch', 'ad', 'mc']},
        'va': {'neighbors': ['it'], 'region': ['sm', 'mc']},
        'cy': {'neighbors': [], 'region': ['gr', 'tr', 'mt']},
        'mt': {'neighbors': [], 'region': ['it', 'gr', 'cy']},
        'az': {'neighbors': ['ru', 'ge', 'am', 'tr', 'ir'], 'region': ['kz', 'tm']},
        'ge': {'neighbors': ['ru', 'az', 'am', 'tr'], 'region': ['ua', 'by']},
        'am': {'neighbors': ['ge', 'az', 'tr', 'ir'], 'region': ['gr', 'sy']},
        'tr': {'neighbors': ['gr', 'bg', 'ge', 'am', 'az', 'ir', 'iq', 'sy'], 'region': ['cy', 'jo']},
    },
    
    # Asia
    'asia': {
        'cn': {'neighbors': ['mn', 'ru', 'kp', 'kr', 'kz', 'kg', 'tj', 'af', 'pk', 'in', 'np', 'bt', 'mm', 'la', 'vn'], 'region': ['jp', 'th']},
        'in': {'neighbors': ['pk', 'cn', 'np', 'bt', 'mm', 'bd'], 'region': ['lk', 'af']},
        'jp': {'neighbors': [], 'region': ['kr', 'cn', 'ph']},
        'kr': {'neighbors': ['kp'], 'region': ['jp', 'cn']},
        'kp': {'neighbors': ['cn', 'ru', 'kr'], 'region': ['mn']},
        'pk': {'neighbors': ['in', 'cn', 'af', 'ir'], 'region': ['np', 'bd']},
        'bd': {'neighbors': ['in', 'mm'], 'region': ['np', 'bt', 'th']},
        'af': {'neighbors': ['ir', 'pk', 'cn', 'tj', 'uz', 'tm'], 'region': ['kz', 'kg']},
        'ir': {'neighbors': ['tr', 'iq', 'af', 'pk', 'tm', 'az', 'am'], 'region': ['kw', 'sa']},
        'iq': {'neighbors': ['tr', 'ir', 'kw', 'sa', 'jo', 'sy'], 'region': ['ae', 'om']},
        'sa': {'neighbors': ['jo', 'iq', 'kw', 'ae', 'om', 'ye'], 'region': ['qa', 'bh']},
        'ye': {'neighbors': ['sa', 'om'], 'region': ['ae', 'er']},
        'om': {'neighbors': ['ae', 'sa', 'ye'], 'region': ['kw', 'ir']},
        'ae': {'neighbors': ['sa', 'om'], 'region': ['qa', 'kw']},
        'kw': {'neighbors': ['iq', 'sa'], 'region': ['ae', 'bh']},
        'qa': {'neighbors': ['sa'], 'region': ['ae', 'bh', 'kw']},
        'bh': {'neighbors': ['sa'], 'region': ['qa', 'kw', 'ae']},
        'jo': {'neighbors': ['sa', 'iq', 'sy', 'il'], 'region': ['lb', 'ye']},
        'sy': {'neighbors': ['tr', 'iq', 'jo', 'il', 'lb'], 'region': ['cy', 'am']},
        'lb': {'neighbors': ['sy', 'il'], 'region': ['jo', 'cy']},
        'il': {'neighbors': ['lb', 'sy', 'jo'], 'region': ['cy', 'tr']},
        'th': {'neighbors': ['mm', 'la', 'kh', 'my'], 'region': ['vn', 'cn']},
        'vn': {'neighbors': ['cn', 'la', 'kh'], 'region': ['th', 'mm']},
        'mm': {'neighbors': ['bd', 'in', 'cn', 'la', 'th'], 'region': ['kh', 'vn']},
        'la': {'neighbors': ['cn', 'mm', 'th', 'kh', 'vn'], 'region': ['np', 'bt']},
        'kh': {'neighbors': ['th', 'la', 'vn'], 'region': ['mm', 'my']},
        'my': {'neighbors': ['th'], 'region': ['id', 'sg', 'bn']},
        'sg': {'neighbors': ['my'], 'region': ['id', 'bn', 'ph']},
        'id': {'neighbors': ['my', 'pg', 'tl'], 'region': ['ph', 'au']},
        'ph': {'neighbors': [], 'region': ['id', 'my', 'cn']},
        'bn': {'neighbors': ['my'], 'region': ['id', 'sg', 'ph']},
        'tl': {'neighbors': ['id'], 'region': ['ph', 'pg']},
        'pg': {'neighbors': ['id'], 'region': ['au', 'sb']},
        'mn': {'neighbors': ['cn', 'ru'], 'region': ['kz', 'kg']},
        'np': {'neighbors': ['cn', 'in'], 'region': ['bt', 'bd', 'pk']},
        'bt': {'neighbors': ['cn', 'in'], 'region': ['np', 'bd', 'mm']},
        'lk': {'neighbors': [], 'region': ['in', 'mv', 'bd']},
        'mv': {'neighbors': [], 'region': ['lk', 'in', 'sc']},
        'kz': {'neighbors': ['ru', 'cn', 'kg', 'uz', 'tm'], 'region': ['mn', 'af']},
        'kg': {'neighbors': ['kz', 'cn', 'tj', 'uz'], 'region': ['af', 'mn']},
        'tj': {'neighbors': ['af', 'cn', 'kg', 'uz'], 'region': ['pk', 'kz']},
        'uz': {'neighbors': ['kz', 'kg', 'tj', 'af', 'tm'], 'region': ['ir', 'pk']},
        'tm': {'neighbors': ['kz', 'uz', 'af', 'ir'], 'region': ['az', 'tj']},
    },
    
    # Africa
    'africa': {
        'eg': {'neighbors': ['ly', 'sd', 'il'], 'region': ['sa', 'jo']},
        'ly': {'neighbors': ['eg', 'sd', 'td', 'ne', 'dz', 'tn'], 'region': ['mr', 'ml']},
        'dz': {'neighbors': ['tn', 'ly', 'ne', 'ml', 'mr', 'ma'], 'region': ['td', 'ng']},
        'ma': {'neighbors': ['dz'], 'region': ['tn', 'mr', 'ml']},
        'tn': {'neighbors': ['dz', 'ly'], 'region': ['ma', 'it']},
        'sd': {'neighbors': ['eg', 'ly', 'td', 'cf', 'ss', 'et', 'er'], 'region': ['sa', 'ye']},
        'ss': {'neighbors': ['sd', 'et', 'ke', 'ug', 'cd', 'cf'], 'region': ['er', 'tz']},
        'et': {'neighbors': ['er', 'dj', 'so', 'ke', 'ss', 'sd'], 'region': ['ug', 'ye']},
        'er': {'neighbors': ['sd', 'et', 'dj'], 'region': ['so', 'ye']},
        'dj': {'neighbors': ['er', 'et', 'so'], 'region': ['ye', 'om']},
        'so': {'neighbors': ['et', 'ke', 'dj'], 'region': ['er', 'ye']},
        'ke': {'neighbors': ['et', 'so', 'ss', 'ug', 'tz'], 'region': ['rw', 'bi']},
        'ug': {'neighbors': ['ss', 'ke', 'tz', 'rw', 'cd'], 'region': ['bi', 'cf']},
        'tz': {'neighbors': ['ke', 'ug', 'rw', 'bi', 'cd', 'zm', 'mw', 'mz'], 'region': ['mz', 'ao']},
        'rw': {'neighbors': ['ug', 'tz', 'bi', 'cd'], 'region': ['ke', 'ss']},
        'bi': {'neighbors': ['rw', 'tz', 'cd'], 'region': ['ug', 'ke']},
        'cd': {'neighbors': ['cf', 'ss', 'ug', 'rw', 'bi', 'tz', 'zm', 'ao', 'cg'], 'region': ['ga', 'cm']},
        'cf': {'neighbors': ['td', 'sd', 'ss', 'cd', 'cg', 'cm'], 'region': ['ga', 'ao']},
        'td': {'neighbors': ['ly', 'sd', 'cf', 'cm', 'ne', 'ng'], 'region': ['ml', 'bf']},
        'ne': {'neighbors': ['ly', 'td', 'ng', 'bj', 'bf', 'ml', 'dz'], 'region': ['mr', 'ci']},
        'ng': {'neighbors': ['ne', 'td', 'cm', 'bj'], 'region': ['tg', 'gh']},
        'cm': {'neighbors': ['ng', 'td', 'cf', 'cg', 'ga', 'gq'], 'region': ['cd', 'ao']},
        'cg': {'neighbors': ['cd', 'cf', 'cm', 'ga', 'ao'], 'region': ['gq', 'st']},
        'ga': {'neighbors': ['cm', 'cg', 'gq'], 'region': ['st', 'ao']},
        'gq': {'neighbors': ['cm', 'ga'], 'region': ['cg', 'st']},
        'ao': {'neighbors': ['cd', 'cg', 'zm', 'na'], 'region': ['bw', 'tz']},
        'zm': {'neighbors': ['cd', 'tz', 'mw', 'mz', 'zw', 'bw', 'na', 'ao'], 'region': ['ao', 'sz']},
        'zw': {'neighbors': ['zm', 'bw', 'za', 'mz'], 'region': ['na', 'sz']},
        'bw': {'neighbors': ['na', 'za', 'zw', 'zm'], 'region': ['ao', 'ls']},
        'na': {'neighbors': ['ao', 'za', 'bw', 'zm'], 'region': ['zw', 'ls']},
        'za': {'neighbors': ['na', 'bw', 'zw', 'mz', 'ls', 'sz'], 'region': ['ao', 'zm']},
        'mz': {'neighbors': ['tz', 'mw', 'zm', 'zw', 'za', 'sz'], 'region': ['ke', 'ao']},
        'mw': {'neighbors': ['tz', 'mz', 'zm'], 'region': ['rw', 'bi']},
        'ls': {'neighbors': ['za'], 'region': ['sz', 'bw']},
        'sz': {'neighbors': ['za', 'mz'], 'region': ['ls', 'zw']},
        'mr': {'neighbors': ['ma', 'dz', 'ml', 'sn'], 'region': ['ne', 'gm']},
        'ml': {'neighbors': ['dz', 'ne', 'bf', 'ci', 'gn', 'sn', 'mr'], 'region': ['ng', 'gh']},
        'sn': {'neighbors': ['mr', 'ml', 'gn', 'gm'], 'region': ['gw', 'ci']},
        'gm': {'neighbors': ['sn'], 'region': ['gw', 'mr']},
        'gw': {'neighbors': ['sn', 'gn'], 'region': ['gm', 'ci']},
        'gn': {'neighbors': ['gw', 'sn', 'ml', 'ci', 'lr', 'sl'], 'region': ['bf', 'gh']},
        'sl': {'neighbors': ['gn', 'lr'], 'region': ['ci', 'gh']},
        'lr': {'neighbors': ['sl', 'gn', 'ci'], 'region': ['gh', 'tg']},
        'ci': {'neighbors': ['lr', 'gn', 'ml', 'bf', 'gh'], 'region': ['tg', 'bj']},
        'gh': {'neighbors': ['ci', 'bf', 'tg'], 'region': ['bj', 'ng']},
        'tg': {'neighbors': ['gh', 'bf', 'bj'], 'region': ['ng', 'ci']},
        'bj': {'neighbors': ['tg', 'bf', 'ne', 'ng'], 'region': ['gh', 'cm']},
        'bf': {'neighbors': ['ml', 'ne', 'bj', 'tg', 'gh', 'ci'], 'region': ['ng', 'td']},
        'mg': {'neighbors': [], 'region': ['mz', 'tz', 'km']},
        'km': {'neighbors': [], 'region': ['mg', 'tz', 'mz']},
        'mu': {'neighbors': [], 'region': ['mg', 're', 'sc']},
        're': {'neighbors': [], 'region': ['mu', 'mg', 'km']},
        'sc': {'neighbors': [], 'region': ['mu', 're', 'mv']},
        'st': {'neighbors': [], 'region': ['ga', 'gq', 'cg']},
    },
    
    # Americas
    'americas': {
        'us': {'neighbors': ['ca', 'mx'], 'region': ['cu', 'bs']},
        'ca': {'neighbors': ['us'], 'region': ['gl', 'is']},
        'mx': {'neighbors': ['us', 'gt', 'bz'], 'region': ['cu', 'cr']},
        'gt': {'neighbors': ['mx', 'bz', 'hn', 'sv'], 'region': ['ni', 'cr']},
        'bz': {'neighbors': ['mx', 'gt'], 'region': ['hn', 'sv']},
        'hn': {'neighbors': ['gt', 'sv', 'ni'], 'region': ['bz', 'cr']},
        'sv': {'neighbors': ['gt', 'hn'], 'region': ['ni', 'cr']},
        'ni': {'neighbors': ['hn', 'cr'], 'region': ['sv', 'pa']},
        'cr': {'neighbors': ['ni', 'pa'], 'region': ['sv', 'co']},
        'pa': {'neighbors': ['cr', 'co'], 'region': ['ni', 'ec']},
        'co': {'neighbors': ['pa', 've', 'br', 'pe', 'ec'], 'region': ['cr', 'gf']},
        'ec': {'neighbors': ['co', 'pe'], 'region': ['pa', 'br']},
        'pe': {'neighbors': ['ec', 'co', 'br', 'bo', 'cl'], 'region': ['ar', 've']},
        'bo': {'neighbors': ['pe', 'br', 'py', 'ar', 'cl'], 'region': ['uy', 'gf']},
        'cl': {'neighbors': ['pe', 'bo', 'ar'], 'region': ['uy', 'br']},
        'ar': {'neighbors': ['bo', 'py', 'br', 'uy', 'cl'], 'region': ['pe', 'fk']},
        'uy': {'neighbors': ['ar', 'br'], 'region': ['py', 'cl']},
        'py': {'neighbors': ['ar', 'bo', 'br'], 'region': ['uy', 'pe']},
        'br': {'neighbors': ['uy', 'ar', 'py', 'bo', 'pe', 'co', 've', 'gy', 'sr', 'gf'], 'region': ['cl', 'ec']},
        've': {'neighbors': ['co', 'br', 'gy'], 'region': ['tt', 'sr']},
        'gy': {'neighbors': ['ve', 'br', 'sr'], 'region': ['gf', 'tt']},
        'sr': {'neighbors': ['gy', 'br', 'gf'], 'region': ['ve', 'tt']},
        'gf': {'neighbors': ['sr', 'br'], 'region': ['gy', 've']},
        'cu': {'neighbors': [], 'region': ['mx', 'jm', 'ht']},
        'jm': {'neighbors': [], 'region': ['cu', 'ht', 'bs']},
        'ht': {'neighbors': ['do'], 'region': ['cu', 'jm']},
        'do': {'neighbors': ['ht'], 'region': ['cu', 'pr']},
        'pr': {'neighbors': [], 'region': ['do', 'cu', 'vi']},
        'bs': {'neighbors': [], 'region': ['us', 'cu', 'jm']},
        'tt': {'neighbors': [], 'region': ['ve', 'gd', 'bb']},
        'bb': {'neighbors': [], 'region': ['tt', 'lc', 'vc']},
        'lc': {'neighbors': [], 'region': ['vc', 'bb', 'dm']},
        'vc': {'neighbors': [], 'region': ['lc', 'bb', 'gd']},
        'gd': {'neighbors': [], 'region': ['vc', 'tt', 'bb']},
        'dm': {'neighbors': [], 'region': ['lc', 'gp', 'mq']},
        'ag': {'neighbors': [], 'region': ['dm', 'kn', 'bb']},
        'kn': {'neighbors': [], 'region': ['ag', 'dm', 'ms']},
        'gl': {'neighbors': [], 'region': ['ca', 'is']},
    },
    
    # Oceania
    'oceania': {
        'au': {'neighbors': [], 'region': ['nz', 'id', 'pg']},
        'nz': {'neighbors': [], 'region': ['au', 'fj', 'to']},
        'fj': {'neighbors': [], 'region': ['nz', 'to', 'vu']},
        'pg': {'neighbors': ['id'], 'region': ['au', 'sb']},
        'sb': {'neighbors': [], 'region': ['pg', 'vu', 'fj']},
        'vu': {'neighbors': [], 'region': ['fj', 'nc', 'sb']},
        'nc': {'neighbors': [], 'region': ['au', 'vu', 'fj']},
        'to': {'neighbors': [], 'region': ['fj', 'nz', 'ws']},
        'ws': {'neighbors': [], 'region': ['to', 'fj', 'ki']},
        'ki': {'neighbors': [], 'region': ['ws', 'mh', 'tv']},
        'tv': {'neighbors': [], 'region': ['ki', 'fj', 'ws']},
        'mh': {'neighbors': [], 'region': ['ki', 'fm', 'pw']},
        'fm': {'neighbors': [], 'region': ['pw', 'mh', 'pg']},
        'pw': {'neighbors': [], 'region': ['fm', 'id', 'ph']},
    }
}

def get_country_code_from_id(card_id):
    """Extract country code from outline-XX format"""
    return card_id.replace('outline-', '')

def get_all_countries_from_regions():
    """Get all country codes from regional data"""
    all_countries = set()
    for region in REGIONS.values():
        all_countries.update(region.keys())
    return all_countries

def generate_distractors(country_code, answer, all_cards):
    """Generate 3 distractors for a country based on geography"""
    distractors = []
    used_codes = {country_code}
    
    # Find the country in regions
    country_data = None
    for region_name, region in REGIONS.items():
        if country_code in region:
            country_data = region[country_code]
            break
    
    if not country_data:
        # Fallback: pick random countries from the file
        candidates = [c for c in all_cards if c['id'] != f"outline-{country_code}"]
        import random
        random.shuffle(candidates)
        return [c['answer'] for c in candidates[:3]]
    
    # Priority 1: Neighbors
    for neighbor in country_data.get('neighbors', []):
        if len(distractors) >= 3:
            break
        if neighbor not in used_codes:
            target_card = next((c for c in all_cards if c['id'] == f"outline-{neighbor}"), None)
            if target_card:
                distractors.append(target_card['answer'])
                used_codes.add(neighbor)
    
    # Priority 2: Regional countries
    for regional in country_data.get('region', []):
        if len(distractors) >= 3:
            break
        if regional not in used_codes:
            target_card = next((c for c in all_cards if c['id'] == f"outline-{regional}"), None)
            if target_card:
                distractors.append(target_card['answer'])
                used_codes.add(regional)
    
    # Priority 3: Same difficulty from same continental region
    if len(distractors) < 3:
        # Find current card
        current_card = next((c for c in all_cards if c['id'] == f"outline-{country_code}"), None)
        if current_card:
            difficulty = current_card.get('difficulty', 'mittel')
            # Get other countries from same continental region
            for region_name, region in REGIONS.items():
                if country_code in region:
                    for other_code in region.keys():
                        if len(distractors) >= 3:
                            break
                        if other_code not in used_codes:
                            target_card = next((c for c in all_cards if c['id'] == f"outline-{other_code}"), None)
                            if target_card and target_card.get('difficulty') == difficulty:
                                distractors.append(target_card['answer'])
                                used_codes.add(other_code)
                    break
    
    # Priority 4: Any from same continental region
    if len(distractors) < 3:
        for region_name, region in REGIONS.items():
            if country_code in region:
                for other_code in region.keys():
                    if len(distractors) >= 3:
                        break
                    if other_code not in used_codes:
                        target_card = next((c for c in all_cards if c['id'] == f"outline-{other_code}"), None)
                        if target_card:
                            distractors.append(target_card['answer'])
                            used_codes.add(other_code)
                break
    
    # Fallback: random countries
    while len(distractors) < 3:
        import random
        candidates = [c for c in all_cards if get_country_code_from_id(c['id']) not in used_codes]
        if not candidates:
            break
        random_card = random.choice(candidates)
        distractors.append(random_card['answer'])
        used_codes.add(get_country_code_from_id(random_card['id']))
    
    return distractors[:3]

def main():
    # Read the file
    file_path = Path(__file__).parent.parent / 'lib' / 'outlineCards.ts'
    content = file_path.read_text(encoding='utf-8')
    
    # Extract the card array
    match = re.search(r'export const outlineCards: Card\[\] = (\[[\s\S]*?\]);', content)
    if not match:
        print("ERROR: Could not find outlineCards array")
        return
    
    # Parse JSON
    cards_json = match.group(1)
    cards = json.loads(cards_json)
    
    print(f"Found {len(cards)} outline cards")
    
    # Generate distractors for each card
    modified_count = 0
    for card in cards:
        if 'distractors' not in card or not card['distractors']:
            country_code = get_country_code_from_id(card['id'])
            distractors = generate_distractors(country_code, card['answer'], cards)
            card['distractors'] = distractors
            modified_count += 1
    
    # Convert back to TypeScript format
    updated_json = json.dumps(cards, ensure_ascii=False, indent=2)
    
    # Replace in file with proper formatting
    new_content = content.replace(match.group(1), updated_json)
    
    # Write back
    file_path.write_text(new_content, encoding='utf-8')
    
    print(f"✅ Added distractors to {modified_count}/{len(cards)} outline cards")
    
    # Verify
    verify_content = file_path.read_text(encoding='utf-8')
    distractor_count = len(re.findall(r'"distractors":', verify_content))
    print(f"Verification: Found {distractor_count} cards with distractors")

if __name__ == '__main__':
    main()

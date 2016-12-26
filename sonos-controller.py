import soco
for zone in soco.discover():
    print zone.player_name

zone_list = list(soco.discover())
zone_list
LR = zone_list[0]
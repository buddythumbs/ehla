import sys, getopt
import soco

def getStatus(player):
    return player.get_current_transport_info()['current_transport_state']

def printInfo(player):
    info = player.get_current_track_info()
    print "Status : %s" % player.get_current_transport_info()['current_transport_state']
    print "Song : %s at %s" % (info['title'],info['position'])
    sys.stdout.flush()

def play(player):
    player.play()

def pause(player):
    player.pause()

def next(player):
    player.next()

def main(argv):
    try:
        # Get all devices in zone
        zone_list = list(soco.discover())
        # Only 1 system in zone - 'Family Room'
        FR = zone_list[0]
    except Exception as e:
        print "Something is fucky with the players!"

    try:
        opts, args = getopt.getopt(argv,"np",["play","pause","status"])
    except getopt.GetoptError:
        print 'Expected options -n "next", -p "previous", --play,--pause'
        sys.stdout.flush()
        sys.exit(2)
    try:
        for opt, arg in opts:
            if opt == '-n':
                print 'Playing next...'
                sys.stdout.flush()
                FR.next()
                FR.play()
                printInfo(FR)
            elif opt == '-p':
                print 'Playing previous...'
                sys.stdout.flush()
                FR.previous()
                FR.play()
                printInfo(FR)
            elif opt == '--play':
                print 'Playing...'
                sys.stdout.flush()
                FR.play()
                printInfo(FR)
            elif opt == '--pause':
                print 'Pausing...'
                sys.stdout.flush()
                FR.pause()
                printInfo(FR)
            elif opt == '--status':
                printInfo(FR)
            else:
                print "Something feels fucky"
    except Exception as e:
        print "cannot access Sonos players"
if __name__ == "__main__":
   main(main(sys.argv[1:]))

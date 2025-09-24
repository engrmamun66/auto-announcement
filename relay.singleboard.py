import hid

VID = 0x16c0
PID = 0x05df

relay = hid.device()
relay.open(VID, PID)

def relay_on(channel):
    relay.write([0x00, 0xff, channel])
    print(f"Relay {channel} ON")

def relay_off(channel):
    relay.write([0x00, 0xfd, channel])
    print(f"Relay {channel} OFF")

if __name__ == "__main__":
    # Read file (example: "1,2,3,4,5")
    with open("relaychannels.txt", "r") as f:
        content = f.read().strip()

    # Parse active channels
    active_channels = {int(x) for x in content.split(",") if x.strip().isdigit()}

    # Loop over all 8-16 relays
    for ch in range(1, 17):
        if ch in active_channels:
            relay_on(ch)
        else:
            relay_off(ch)

    relay.close()

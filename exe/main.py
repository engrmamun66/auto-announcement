import re
import requests
from pynput import keyboard

# Initialize global variable to collect user input
user_input = ""

def process_input(input_text):
    if re.match(r"^/\d+/$", input_text):  # Check if input matches the pattern
        api_url = "http://192.168.31.167:2323/api/card-punch"
        data = {"input": input_text}
        try:
            response = requests.post(api_url, json=data)
            print(f"API Response: {response.status_code}, {response.json()}")
        except requests.exceptions.RequestException as e:
            print(f"Error sending data to the API: {e}")
    else:
        print("Pattern doesn't match. Ignoring input.")

# Function to handle keypress events
def on_press(key):
    global user_input
    try:
        if key == keyboard.Key.enter:  # Process input when Enter key is pressed
            process_input(user_input.strip())
            user_input = ""  # Reset input
        elif key == keyboard.Key.backspace:  # Handle backspace
            user_input = user_input[:-1]
        else:
            # Append character to input
            user_input += key.char
    except AttributeError:
        # Ignore special keys like Shift, Ctrl, etc.
        pass

def main():
    # Start listening to keyboard events
    with keyboard.Listener(on_press=on_press) as listener:
        listener.join()

if __name__ == "__main__":
    main()

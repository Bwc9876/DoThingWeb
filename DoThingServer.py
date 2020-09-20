import os
import sys
from BLib.Network.Connection import Connection
from manage import main

if (not os.path.exists("Server.config")):
		print("No Server Config File Detected, Entering Setup")
		server_ip = input("Please enter the IP address of the main server: ")
		try:
			con = Connection(server_ip, 8080)
			con.Send("T/Hello")
			response = con.WaitUntilRecv()
			con.Close()
		except ConnectionError:
			print("Error: Server did not respond")
			sys.exit()
		if (not response == "Hello"):
			print("Error: Server did not respond correctly")
			sys.exit()
		print("Succesfully Contacted Server, saving settings now")
		f = open("Server.config", 'w+')
		f.write(server_ip)
		f.close()
		print("Wrote settings to file, starting the server")
		main()
else:
	try:
		f = open("Server.config", 'r')
		server_ip = f.read()
		f.close()
		con = Connection(server_ip, 8080)
		con.Send("T/Hello")
		response = con.WaitUntilRecv()
		con.Close()
	except ConnectionError:
		print("Error: Server did not respond, delete the config file to restart setup")
		sys.exit()
	print(response)
	if (not response == "Hello"):
		print("Error: Server did not respond correctly, delete the config file to restart setup")
		sys.exit()
	main()
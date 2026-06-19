>>> Sharing by code does not require token.

>>> Still, first request will be register to the token irrespective of the mode

>>> Who want to send the file will scan QR or give recipient ids.

>>> We prioritizing speed over consistency.

>>> We are creating user in DB first, then cache asynchronously.

>>> And the opposite approach for updating the files and location. 

>>> Sharing by nearby-device requires token
- The user will get the token 
- When user click on near-by devices client will send the location to the backend.
- Location of users will be sent only when they click on this option.




> To add on
- Show consent dialogue to the sender to both mode 
- Currently manual code does not have consent option to the sender.

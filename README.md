TextEmail bridges the gap between sms and email communication by allowing users to send emails via sms.
The idea is for a user to text a server with the email they want to send to a server that processes the sms data and uses your
primary email to send to the email to the recipient. From the perspective of the recipent makes the email seems that it was sent from gmail,outlook, etc
rather than text since it is coming from a trusted email address with formatting. 

Compared to directly texting an email address yields an email that sends the text content of the email in a .txt file
and an address with the format PHONENUMBER@Carrier.com.

To accomplish an mvp of this product I connected my email account to the google api. The email waits
for these unformatted sms emails and sends them with proper formatting. In designing the ux for this service
I chose to seperate picking a recipent email address and sending the address.

https://www.youtube.com/watch?v=webqRA2s0jk

[![TexEmail Demo](http://img.youtube.com/vi/watch?v=webqRA2s0jk/0.jpg)](http://www.youtube.com/watch?v=watch?v=webqRA2s0jk"TextEmail Demo")

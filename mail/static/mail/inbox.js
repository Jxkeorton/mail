document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // send mail
  document.querySelector('#compose-form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#received-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_mail(id) {

  
  // get specific email
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    //show only received email view
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#received-email').style.display = 'block';

    document.querySelector('#received-email').innerHTML = `
    <p><strong>From:</strong> ${email.sender}</p>
    <p><strong>To:</strong> ${email.recipients}</p>
    <p><strong>Subject:</strong> ${email.subject}</p>
    <p><strong>Timestamp:</strong> ${email.timestamp}</p>
    <br></br>
    <p>${email.body}</p>
    `;

    // change to read 
    if(!email.read){
      // change to read 
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    }

    // Archive button 
    const archive = document.createElement('button');
    archive.innerHTML = email.archived ? 'Unarchive' : 'Archive';
    archive.className = email.archived ? 'btn btn-success' : 'btn btn-danger';
    archive.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: !email.archived
        })
      })
      .then(() => {load_mailbox('archive')})
    });
    document.querySelector('#received-email').append(archive);

    // reply button
    const reply = document.createElement('button');
    reply.innerHTML = 'Reply';
    reply.className = 'btn btn-dark';
    reply.addEventListener('click', function() {
      // get email form
      compose_email();

      //pre populate the input fields
      document.querySelector('#compose-recipients').value = email.sender;
      let subject = email.subject;
      if(subject.split(' ',1)[0] != 'Re:'){
        subject = "Re: " + email.subject;
      }
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp} , ${email.sender} wrote: ${email.body}`;

    });
    document.querySelector('#received-email').append(reply);
  });

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#received-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get request to mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    emails.forEach(email => {

      // create div for each email
      const element = document.createElement('div');
      element.className = "container";
      element.innerHTML = `
        <p id="title"><strong>From: ${email.sender}</strong> // ${email.subject}</p>
        <p id="timestamp">${email.timestamp}</p>
      `;

      // unread = white background , read = grey background
      element.className = email.read ? 'read' : 'unread';
      // view mail function used
      element.addEventListener('click', function() {
        view_mail(email.id)
      });
      document.querySelector('#emails-view').append(element);

    }); 
  });
}

function send_mail() {

  // get form info
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // POST request to /emails
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);

      // load sent mailbox
      load_mailbox('sent');
  });
}


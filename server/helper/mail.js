
import nodemailer from 'nodemailer'

export const sentOTP=(email, otp)=> {
    return new Promise((resolve, reject)=>{
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
      }
  });
  var mailOptions = {
      from:process.env.EMAIL,
      to: email,
      subject: "AUTOAID Email verification",
      html: `
                <h1>Verify Your Email For AUTOAID</h1>
                  <h3>use this code <h2>${otp}</h2> to verify your email</h3>
                 
               `
  };
  transporter.sendMail(mailOptions,(err,res)=>{
      if(err){
          console.log(err);
      }
      else {
  
      }
  });
    })
    
}

 
  export const signupMail=(email,name)=> {
      return new Promise((resolve, reject)=>{
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    var mailOptions = {
        from:process.env.EMAIL,
        to: email,
        subject: " Welcome to Autocare - Application Confirmation",
        html: `   <h3> Dear ${name} ,<h3>
                  <p>

                  Thank you for signing up for the mechanic position in our Autocare application. We are excited to have you on board and look forward to working with you.<br>
                  
                  As a mechanic, you will be responsible for providing high-quality service to our clients and ensuring that their vehicles are well-maintained. Your expertise and experience will be valuable assets to our team.<br>
                  
                  Please note that we are currently reviewing your application and will contact you within the next few days regarding next steps. In the meantime, if you have any questions or concerns, please do not hesitate to contact us.<br>
                  
                  Once again, thank you for choosing Autocare. We are confident that you will be a great addition to our team and we look forward to working with you.<br>
                  
                  Best regards,<br><br>
                  
            
                  
                  Autocare Team
                  
                  
                  
                  
                  
                  </p>
                   
                   
                 `
    };
    transporter.sendMail(mailOptions,(err,res)=>{
        if(err){
            console.log(err);
        }
        else {
    
        }
    });
      })
      
  }
  export const approvedMail=(email,name)=> {
    return new Promise((resolve, reject)=>{
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
      }
  });
  var mailOptions = {
      from:process.env.EMAIL,
      to: email,
      subject: "Application status",
      html: `   <h5> Dear ${name} <h5><br>
                <p>We are excited to inform you that your application for the mechanic position at AutoCare has been approved. Congratulations and welcome aboard! <br><br>
                Autocare Team</p>
                 
                 
               `
  };
  transporter.sendMail(mailOptions,(err,res)=>{
      if(err){
          console.log(err);
      }
      else {
  
      }
  });
    })
    
}
export const portfolio_mail=(name,email,options)=> {
  return new Promise((resolve, reject)=>{
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.PORTFOLIO_EMAIL,
        pass: process.env.PORTFOLIO_PASSWORD
    }
});
var mailOptions = {
    from:process.env.PORTFOLIO_EMAIL,
    to: process.env.PORTFOLIO_EMAIL,
    subject: "Client Request",
    html: `   <h5>${name} requested for a work <h5><br>
              <p>Mr/Mrs ${name} with the email ${email} requested for the ${options} work.</p>
               
               
             `
};
transporter.sendMail(mailOptions,(err,res)=>{
    if(err){
        console.log(err);
    }
    else {

    }
});
  })
  
}
export const rejectMail=(email,name)=> {
    return new Promise((resolve, reject)=>{
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
      }
  });
  var mailOptions = {
      from:process.env.EMAIL,
      to: email,
      subject: "Application status",
      html: `   <h5> Dear ${name} <h5><br><br>
      <p>
      Thank you for taking the time to apply for the mechanic position in our AutoCare application.<br> We appreciate your interest and effort in applying for the job.<br>

      We regret to inform you that after careful consideration of your application, we have decided not to move forward with your candidacy at this time. We understand that this news may be disappointing, but we want to assure you that the decision was based on the needs of our organization and the specific qualifications required for the role.<br>
      
      We encourage you to continue to explore other job opportunities that match your skills and experience. We will keep your resume on file, and should a suitable position arise in the future, we will not hesitate to contact you.<br>
      
      Thank you once again for your interest in working with us. We wish you all the best for your future career.<br>
      
      Sincerely,<br><br>
      AutoCare team.</p>

                 
                 
               `
  };
  transporter.sendMail(mailOptions,(err,res)=>{
      if(err){
          console.log(err);
      }
      else {
  
      }
  });
    })
    
}

// module.exports.applicationMail('jithunmadhavct@gmail.com','jithun').then((result) => {
//     console.log("success");
// }).catch((err) => {
//     console.log("failed");
// });

import fs from 'fs';

export const  sendInvoice=async(email,invoice)=> {
  try {
    // Create a Nodemailer transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    // Read the invoice PDF file
    const invoicePath = `/home/jithun/Desktop/AutoAid/server/helper/invoice/${invoice}`;
    const invoiceContent = fs.readFileSync(invoicePath);

    // Create a mail options object
    const mailOptions = {
        from:process.env.EMAIL,
      to: email,
      subject: 'Invoice',
      text: 'Please find the attached invoice.',
      attachments: [
        {
          filename: `${invoice}`,
          content: invoiceContent,
        },
      ],
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

